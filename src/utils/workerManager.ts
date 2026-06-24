/**
 * Worker Manager
 * Web Workerのライフサイクルを管理
 * 仕様: 2.1.5 バッチ処理、2.3.1 処理速度、3.1 信頼性
 */

import type {
  WorkerRequest,
  WorkerResponse,
  WorkerDecodedMessage,
  ConversionJob,
} from '@/workers/types';
import type { ConversionSettings } from './settings';
import { ETACalculator } from './etaCalculator';
import { renderToBlob } from '@/workers/imagePipeline';
import { domCanvasEnv } from './domCanvasEnv';

type JobCallback = (job: ConversionJob) => void;

export class WorkerManager {
  private worker: Worker | null = null;
  private jobs: Map<string, ConversionJob> = new Map();
  private onJobUpdate?: JobCallback;
  private restartAttempts = 0;
  private maxRestartAttempts = 3;
  private etaCalculator: ETACalculator;
  private processingCount = 0;
  private maxConcurrent = 2; // 並列処理数

  constructor(onJobUpdate?: JobCallback) {
    this.onJobUpdate = onJobUpdate;
    this.etaCalculator = new ETACalculator();
  }

  /**
   * Workerを初期化
   */
  private initWorker(): Worker {
    // Workerを作成（Viteのモジュールワーカー構文）
    const worker = new Worker(
      new URL('../workers/imageProcessor.ts', import.meta.url),
      { type: 'module' }
    );

    // Workerからのメッセージを処理
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(e.data);
    };

    // Workerエラーハンドリング
    worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.handleWorkerCrash();
    };

    return worker;
  }

  /**
   * Workerからのメッセージを処理
   */
  private handleWorkerMessage(response: WorkerResponse): void {
    const job = this.jobs.get(response.jobId);
    if (!job) {
      console.warn('Unknown job ID:', response.jobId);
      return;
    }

    switch (response.type) {
      case 'progress':
        job.phase = response.phase;
        job.progress = response.progress;
        job.status = 'processing';
        break;

      case 'success':
        job.status = 'succeeded';
        job.progress = 100;
        job.result = response.blob;
        job.endTime = Date.now();

        // ETAメトリクスに追加
        if (response.metadata && job.startTime) {
          this.etaCalculator.addMetric(
            response.metadata.width,
            response.metadata.height,
            response.metadata.processingTime
          );
        }

        // 次のジョブを処理
        this.processingCount--;
        this.processNextJob();
        break;

      case 'decoded':
        // OffscreenCanvas 2D 非対応の Worker からのフォールバック。
        // resize/encode をメインスレッドの <canvas> で完了させる（非同期）。
        // 完了/失敗・processingCount の後始末は finishOnMainThread 側で行うため、
        // ここでは末尾の onJobUpdate を呼ばずに return する。
        void this.finishOnMainThread(job, response);
        return;

      case 'error':
        job.status = 'failed';
        job.error = response.error;
        job.phase = response.phase;
        job.endTime = Date.now();

        // 次のジョブを処理
        this.processingCount--;
        this.processNextJob();
        break;
    }

    this.onJobUpdate?.(job);
  }

  /**
   * フォールバック経路の仕上げ（メインスレッド）。
   * Worker が OffscreenCanvas 2D 非対応のため decode のみ行い、resize/encode を
   * ここ（HTMLCanvasElement）で完了させる。成功/失敗のジョブ状態遷移は
   * success/error ケースと同じ形に揃える。
   */
  private async finishOnMainThread(
    job: ConversionJob,
    msg: WorkerDecodedMessage
  ): Promise<void> {
    try {
      job.status = 'processing';
      job.phase = 'encode';
      job.progress = 0;
      this.onJobUpdate?.(job);

      const imageData = new ImageData(
        new Uint8ClampedArray(msg.buffer),
        msg.width,
        msg.height
      );
      const { blob, width, height } = await renderToBlob(
        imageData,
        job.settings,
        domCanvasEnv
      );

      job.status = 'succeeded';
      job.progress = 100;
      job.result = blob;
      job.endTime = Date.now();

      const processingTime = job.startTime ? Date.now() - job.startTime : msg.decodeTime;
      this.etaCalculator.addMetric(width, height, processingTime);
    } catch (error) {
      job.status = 'failed';
      job.phase = 'encode';
      job.error = error instanceof Error ? error.message : 'Encode failed on main thread';
      job.endTime = Date.now();
    } finally {
      this.processingCount--;
      this.processNextJob();
      this.onJobUpdate?.(job);
    }
  }

  /**
   * Workerクラッシュ時の処理
   */
  private handleWorkerCrash(): void {
    console.error('Worker crashed');

    // 再起動を試みる
    if (this.restartAttempts < this.maxRestartAttempts) {
      this.restartAttempts++;
      console.log(`Worker restart attempt ${this.restartAttempts}/${this.maxRestartAttempts}`);

      this.worker?.terminate();
      this.worker = this.initWorker();

      // 未完了のジョブを再実行
      this.retryPendingJobs();
    } else {
      // 最大再起動回数を超えた
      console.error('Worker restart attempts exceeded');

      // すべての未完了ジョブを失敗にする
      for (const [, job] of this.jobs) {
        if (job.status === 'processing' || job.status === 'pending') {
          job.status = 'failed';
          job.error = 'Workerが停止しました。ページを再読み込みしてください。';
          this.onJobUpdate?.(job);
        }
      }
    }
  }

  /**
   * 未完了のジョブを再試行
   */
  private retryPendingJobs(): void {
    for (const [, job] of this.jobs) {
      if (job.status === 'processing') {
        job.status = 'pending';
        job.progress = 0;
        this.processJob(job);
      }
    }
  }

  /**
   * ジョブを追加
   */
  addJob(file: File, settings: ConversionSettings): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: ConversionJob = {
      id: jobId,
      file,
      settings,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
    };

    this.jobs.set(jobId, job);
    this.onJobUpdate?.(job);

    // 並列処理数の制限内であれば即座に処理
    if (this.processingCount < this.maxConcurrent) {
      this.processJob(job);
    }

    return jobId;
  }

  /**
   * 次のジョブを処理
   */
  private processNextJob(): void {
    if (this.processingCount >= this.maxConcurrent) {
      return;
    }

    // pending状態のジョブを探す
    for (const [, job] of this.jobs) {
      if (job.status === 'pending' && this.processingCount < this.maxConcurrent) {
        this.processJob(job);
      }
    }
  }

  /**
   * ジョブを処理
   */
  private processJob(job: ConversionJob): void {
    if (!this.worker) {
      this.worker = this.initWorker();
    }

    job.status = 'processing';
    job.startTime = Date.now();
    this.processingCount++;

    // テスト用シーム: グローバルフラグが立っていれば worker に
    // メインスレッド encode を強制させる（Safari フォールバック経路の検証用）。本番は false。
    const forceMainThreadEncode =
      (globalThis as Record<string, unknown>).__HEIC_FORCE_MAIN_THREAD_ENCODE__ === true;

    const request: WorkerRequest = {
      type: 'convert',
      jobId: job.id,
      file: job.file,
      settings: job.settings,
      forceMainThreadEncode,
    };

    this.worker.postMessage(request);
    this.onJobUpdate?.(job);
  }

  /**
   * ジョブを取得
   */
  getJob(jobId: string): ConversionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * すべてのジョブを取得
   */
  getAllJobs(): ConversionJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * ジョブをクリア
   */
  clearJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  /**
   * すべてのジョブをクリア
   */
  clearAllJobs(): void {
    this.jobs.clear();
    this.processingCount = 0;
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    const allJobs = Array.from(this.jobs.values());
    const succeeded = allJobs.filter((j) => j.status === 'succeeded').length;
    const failed = allJobs.filter((j) => j.status === 'failed').length;
    const processing = allJobs.filter((j) => j.status === 'processing').length;
    const pending = allJobs.filter((j) => j.status === 'pending').length;

    return {
      total: allJobs.length,
      succeeded,
      failed,
      processing,
      pending,
      averageSpeed: this.etaCalculator.getAverageSpeed(),
    };
  }

  /**
   * Workerを終了
   */
  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.jobs.clear();
    this.processingCount = 0;
  }
}

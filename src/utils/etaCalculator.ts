/**
 * ETA Calculator - 推定残り時間の計算
 * 仕様: 2.1.6 進捗表示、2.3.3 ETA計算
 */

interface ProcessingMetrics {
  megapixels: number;
  processingTime: number; // ミリ秒
  timestamp: number;
}

const STORAGE_KEY = 'heic-to-jpg-metrics';
const MAX_STORED_METRICS = 20;
const EMA_ALPHA = 0.3; // 指数移動平均の重み

export class ETACalculator {
  private metrics: ProcessingMetrics[] = [];
  private currentEMA: number = 0; // MP/秒

  constructor() {
    this.loadMetrics();
  }

  /**
   * LocalStorageからメトリクスを読み込み
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.metrics = JSON.parse(stored);
        this.calculateEMA();
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
      this.metrics = [];
    }
  }

  /**
   * LocalStorageにメトリクスを保存
   */
  private saveMetrics(): void {
    try {
      // 最新20件のみ保存
      const toSave = this.metrics.slice(-MAX_STORED_METRICS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * 指数移動平均を計算
   */
  private calculateEMA(): void {
    if (this.metrics.length === 0) {
      this.currentEMA = 0;
      return;
    }

    // 最初の値から開始
    let ema = this.metrics[0].megapixels / (this.metrics[0].processingTime / 1000);

    // EMAを計算
    for (let i = 1; i < this.metrics.length; i++) {
      const metric = this.metrics[i];
      const mpPerSec = metric.megapixels / (metric.processingTime / 1000);
      ema = EMA_ALPHA * mpPerSec + (1 - EMA_ALPHA) * ema;
    }

    this.currentEMA = ema;
  }

  /**
   * 新しいメトリクスを追加
   */
  addMetric(width: number, height: number, processingTime: number): void {
    const megapixels = (width * height) / 1000000;

    const metric: ProcessingMetrics = {
      megapixels,
      processingTime,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.calculateEMA();
    this.saveMetrics();
  }

  /**
   * ETAを計算（秒単位）
   */
  calculateETA(remainingFiles: Array<{ width: number; height: number }>): number {
    if (this.currentEMA === 0 || remainingFiles.length === 0) {
      return 0;
    }

    // 残りのメガピクセル数を計算
    const totalMP = remainingFiles.reduce((sum, file) => {
      return sum + (file.width * file.height) / 1000000;
    }, 0);

    // ETA = 総MP / (MP/秒)
    return totalMP / this.currentEMA;
  }

  /**
   * 平均処理速度を取得（MP/秒）
   */
  getAverageSpeed(): number {
    return this.currentEMA;
  }

  /**
   * メトリクスをクリア
   */
  clearMetrics(): void {
    this.metrics = [];
    this.currentEMA = 0;
    localStorage.removeItem(STORAGE_KEY);
  }
}

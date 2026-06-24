/**
 * ConversionManager コンポーネント
 * ファイルアップロード、設定、変換処理を統合管理
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { SettingsPanel } from './SettingsPanel';
import { AppCard } from './AppCard';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { ToastNotification } from './ToastNotification';
import { ErrorToast } from './ErrorToast';
import { WorkerManager } from '@/utils/workerManager';
import { type ConversionSettings } from '@/utils/settings';
import { loadSettings, saveSettings } from '@/utils/settingsStorage';
import { downloadSingleFile } from '@/utils/zipDownload';
import { ui } from '@/i18n/ui';
import type { ConversionJob } from '@/workers/types';

interface ErrorToastItem {
  id: string;
  message: string;
}

/**
 * HEIC/HEIFファイルかどうかを判定
 */
function isHEICFile(file: File): boolean {
  const extension = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  return (
    extension.endsWith('.heic') ||
    extension.endsWith('.heif') ||
    mimeType === 'image/heic' ||
    mimeType === 'image/heif'
  );
}

// HEIC のデコードは Web Worker 内（imageProcessor.ts）で libheif-js により実行する。
// メインスレッドはブロッキングと二重エンコードを避けるため変換処理を持たない。

interface ConversionManagerProps {
  locale?: string;
}

export function ConversionManager({ locale = 'en' }: ConversionManagerProps) {
  const t = (ui as any)[locale] ?? ui.en;
  const [settings, setSettings] = useState<ConversionSettings>(() => loadSettings());
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [stats, setStats] = useState({ total: 0, succeeded: 0, failed: 0, processing: 0, pending: 0, averageSpeed: 0 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const workerManagerRef = useRef<WorkerManager | null>(null);
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());
  const erroredJobIdsRef = useRef<Set<string>>(new Set());
  const [failedDownloads, setFailedDownloads] = useState<ConversionJob[]>([]);
  const [errorToasts, setErrorToasts] = useState<ErrorToastItem[]>([]);

  // エラートーストを表示
  const showErrorToast = useCallback((message: string) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setErrorToasts((prev) => [...prev, { id, message }]);
  }, []);

  // エラートーストを削除
  const removeErrorToast = useCallback((id: string) => {
    setErrorToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // WorkerManagerを初期化
  useEffect(() => {
    // E2E 用の準備完了シグナル（ハイドレーション後に変換を受け付けられる時点）。
    (globalThis as Record<string, unknown>).__toolReady = true;
    workerManagerRef.current = new WorkerManager((updatedJob) => {
      setJobs((prevJobs) => {
        const index = prevJobs.findIndex((j) => j.id === updatedJob.id);
        if (index >= 0) {
          const newJobs = [...prevJobs];
          newJobs[index] = updatedJob;
          return newJobs;
        }
        return [...prevJobs, updatedJob];
      });
    });

    return () => {
      workerManagerRef.current?.terminate();
    };
  }, []);

  // 統計情報を定期的に更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (workerManagerRef.current) {
        setStats(workerManagerRef.current.getStats());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 完了したジョブを自動ダウンロード
  useEffect(() => {
    jobs.forEach((job) => {
      if (
        job.status === 'succeeded' &&
        job.result &&
        !downloadedJobIdsRef.current.has(job.id)
      ) {
        try {
          downloadSingleFile(job);
          downloadedJobIdsRef.current.add(job.id);
        } catch (error) {
          console.error(`${job.file.name} の自動ダウンロードに失敗:`, error);
          // 自動ダウンロード失敗時は失敗リストに追加
          setFailedDownloads((prev) => {
            if (!prev.find((j) => j.id === job.id)) {
              return [...prev, job];
            }
            return prev;
          });
        }
      }
    });
  }, [jobs]);

  // 変換失敗をトーストで通知（worker からの error を拾う）
  useEffect(() => {
    jobs.forEach((job) => {
      if (job.status === 'failed' && !erroredJobIdsRef.current.has(job.id)) {
        erroredJobIdsRef.current.add(job.id);
        showErrorToast(`${job.file.name}: ${job.error ?? t.errConversionFailed}`);
      }
    });
  }, [jobs, showErrorToast]);

  // 設定変更時に自動保存
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // ファイルが選択された時 - 即座に変換開始
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    // 各ファイルに対して即座にジョブを作成
    for (const file of newFiles) {
      try {
        // HEIC/HEIFファイルかチェック
        if (!isHEICFile(file)) {
          // 対応外の画像形式の場合はエラートーストを表示
          showErrorToast(t.errUnsupported.replace('{name}', file.name));
          continue;
        }

        // 生の HEIC/HEIF をそのまま worker へ（worker 内で libheif デコード→単一 encode）
        workerManagerRef.current?.addJob(file, settings);
      } catch (error) {
        // HEIC変換エラーの場合はエラートーストを表示
        showErrorToast(`${file.name}: ${error instanceof Error ? error.message : t.errConversionFailed}`);
      }
    }

    // 処理完了を通知（GlobalDropZoneに）
    window.dispatchEvent(new CustomEvent('filesProcessed'));
  }, [settings, showErrorToast]);

  // グローバルドロップゾーンからのファイルドロップを受信
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<File[]>;
      handleFilesSelected(customEvent.detail);
    };
    window.addEventListener('filesDropped', handler);
    return () => window.removeEventListener('filesDropped', handler);
  }, [handleFilesSelected]);

  // 単一ファイルをダウンロード
  const handleDownload = (job: ConversionJob) => {
    try {
      downloadSingleFile(job);
      downloadedJobIdsRef.current.add(job.id);
      // 成功したら失敗リストから削除
      setFailedDownloads((prev) => prev.filter((j) => j.id !== job.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : t.errDownloadFailed);
    }
  };

  // 失敗リストをクリア
  const handleClearFailedDownloads = () => {
    setFailedDownloads([]);
  };

  return (
    <div>
      {/* ファイルアップロード */}
      <AppCard>
        {/* ヘッダー */}
        <div style="margin-bottom: var(--space-4);">
          <h3 style="margin: 0 0 var(--space-1) 0; font-size: var(--fs-4); font-weight: 600;">
            {t.uploadHeading}
          </h3>
          <p style="margin: 0; font-size: var(--fs-2); color: var(--color-subtle);">
            {t.uploadSubtitle}
          </p>
        </div>

        <div
          style={{
            padding: 'var(--space-6)',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            marginBottom: 'var(--space-4)',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div style="font-size: 3rem; margin-bottom: var(--space-2);">📁</div>
          <div style="font-size: var(--fs-3); font-weight: 600; margin-bottom: var(--space-2);">
            {t.dropClick}
          </div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle);">
            {t.dropOr}
          </div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle); margin-top: var(--space-1);">
            {t.dropSupported}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(e.currentTarget.files || []);
              handleFilesSelected(selectedFiles);
            }}
            style="display: none;"
          />
        </div>

        {/* 設定ボタン */}
        <div style="display: flex; justify-content: flex-end;">
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label={t.openSettingsAria}
            style="background: none; border: none; font-size: var(--fs-2); cursor: pointer; padding: var(--space-2); border-radius: var(--radius-sm); transition: all var(--dur-mid) var(--ease); color: var(--color-primary); font-weight: 500;"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-alpha)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {t.settingsButton}
          </button>
        </div>
      </AppCard>

      {/* 統計情報バー */}
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-top: var(--space-6); padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        <div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle);">{t.statTotal}</div>
          <div style="font-size: var(--fs-4); font-weight: 600;" class="num">{stats.total}</div>
        </div>
        <div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle);">{t.statProcessing}</div>
          <div style="font-size: var(--fs-4); font-weight: 600; color: var(--color-primary);" class="num">{stats.processing}</div>
        </div>
        <div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle);">{t.statDone}</div>
          <div style="font-size: var(--fs-4); font-weight: 600; color: var(--color-success);" class="num">{stats.succeeded}</div>
        </div>
        <div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle);">{t.statFailed}</div>
          <div style="font-size: var(--fs-4); font-weight: 600; color: var(--color-danger);" class="num">{stats.failed}</div>
        </div>
      </div>

      {/* ダウンロード失敗リスト */}
      {failedDownloads.length > 0 && (
        <AppCard title={t.failedDownloadTitle} description={t.failedDownloadDesc} className="mt-6">
          <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-4);">
            <AppButton variant="secondary" onClick={handleClearFailedDownloads}>
              {t.clearAll}
            </AppButton>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            {failedDownloads.map((job) => (
              <div
                key={job.id}
                style="padding: var(--space-4); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;"
              >
                <div>
                  <strong>{job.file.name}</strong>
                  <div style="font-size: var(--fs-2); color: var(--color-subtle); margin-top: var(--space-1);">
                    {t.convertedManual}
                  </div>
                </div>
                <AppButton variant="primary" onClick={() => handleDownload(job)}>
                  {t.download}
                </AppButton>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      {/* トースト通知コンテナ */}
      <div className="toast-container">
        {jobs.filter((job) => job.status === 'processing' || job.status === 'pending').map((job) => (
          <ToastNotification key={job.id} job={job} locale={locale} />
        ))}
      </div>

      {/* エラートースト通知 */}
      {errorToasts.length > 0 && (
        <div className="error-toast-container" aria-label={t.notificationsAria}>
          {errorToasts.map((toast) => (
            <ErrorToast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              onClose={removeErrorToast}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* 設定モーダル */}
      <AppModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={t.conversionSettings}
        locale={locale}
      >
        <SettingsPanel settings={settings} onChange={setSettings} locale={locale} />
      </AppModal>
    </div>
  );
}

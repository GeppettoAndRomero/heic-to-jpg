/**
 * ToastNotification コンポーネント
 * 処理中のファイル変換を表示するトースト通知
 */

import type { ConversionJob, ProcessingPhase, JobStatus } from '@/workers/types';
import { ui } from '@/i18n/ui';

interface ToastNotificationProps {
  job: ConversionJob;
  locale?: string;
}

export function ToastNotification({ job, locale = 'en' }: ToastNotificationProps) {
  const t = (ui as any)[locale] ?? ui.en;

  const getPhaseText = (status: JobStatus, phase?: ProcessingPhase) => {
    if (status === 'pending') {
      return t.stWaiting;
    }
    if (status === 'failed') {
      return t.stFailed;
    }
    if (status === 'succeeded') {
      return t.stDone;
    }

    // processing状態でphaseを見る
    switch (phase) {
      case 'decode':
        return t.phDecoding;
      case 'resize':
        return t.phResizing;
      case 'encode':
        return t.phEncoding;
      case 'complete':
        return t.stDone;
      default:
        return t.phProcessing;
    }
  };

  const getPhaseColor = (status: JobStatus) => {
    if (status === 'pending') {
      return 'var(--color-subtle)';
    }
    if (status === 'failed') {
      return 'var(--color-danger)';
    }
    if (status === 'succeeded') {
      return 'var(--color-success)';
    }
    // processing状態
    return 'var(--color-primary)';
  };

  return (
    <div className="toast">
      <div className="toast__content">
        <div className="toast__header">
          <span className="toast__filename">{job.file.name}</span>
          <span
            className="toast__phase"
            style={{ color: getPhaseColor(job.status) }}
          >
            {getPhaseText(job.status, job.phase)}
          </span>
        </div>
        {job.status === 'processing' && (
          <div className="toast__progress-wrapper">
            <div className="toast__progress">
              <div
                className="toast__progress-bar"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <span className="toast__progress-text">{job.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

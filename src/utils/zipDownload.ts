/**
 * ZIP Download Utility
 * ZIP形式で複数ファイルを一括ダウンロード
 * 仕様: 2.1.4 一括ダウンロード
 */

import { BlobWriter, ZipWriter } from '@zip.js/zip.js';
import type { ConversionJob } from '@/workers/types';
import type { ConversionSettings } from './settings';

export interface ZipDownloadOptions {
  filenamePattern?: string; // e.g., "{base}_{width}x{height}.{ext}"
  includeFailedJobs?: boolean;
}

/**
 * ファイル名パターンを解決
 */
function resolveFilenamePattern(
  job: ConversionJob,
  pattern: string,
  settings: ConversionSettings
): string {
  const baseName = job.file.name.replace(/\.[^.]+$/, '');
  const ext = settings.outputFormat === 'jpeg' ? 'jpg' : 'png';

  // メタデータが利用可能な場合は使用
  const width = 'unknown';
  const height = 'unknown';

  // パターン置換
  return pattern
    .replace('{base}', baseName)
    .replace('{original}', job.file.name)
    .replace('{width}', width)
    .replace('{height}', height)
    .replace('{ext}', ext);
}

/**
 * デフォルトのファイル名を生成
 */
function getDefaultFilename(job: ConversionJob, settings: ConversionSettings): string {
  const baseName = job.file.name.replace(/\.[^.]+$/, '');
  const ext = settings.outputFormat === 'jpeg' ? 'jpg' : 'png';
  return `${baseName}.${ext}`;
}

/**
 * 変換済みジョブをZIPファイルとしてダウンロード
 */
export async function downloadAsZip(
  jobs: ConversionJob[],
  options: ZipDownloadOptions = {}
): Promise<void> {
  const {
    filenamePattern,
    includeFailedJobs = false,
  } = options;

  // 成功したジョブのみをフィルタ（オプションで失敗も含める）
  const validJobs = jobs.filter((job) => {
    if (job.status === 'succeeded' && job.result) return true;
    if (includeFailedJobs && job.status === 'failed') return true;
    return false;
  });

  if (validJobs.length === 0) {
    // 開発者向け内部メッセージ。ユーザー表示は呼び出し側でロケール別文言に差し替える。
    throw new Error('No downloadable files');
  }

  // ZIPファイルを作成
  const blobWriter = new BlobWriter('application/zip');
  const zipWriter = new ZipWriter(blobWriter);

  try {
    // 各ジョブの結果をZIPに追加
    for (const job of validJobs) {
      if (!job.result) continue;

      // ファイル名を生成
      const filename = filenamePattern
        ? resolveFilenamePattern(job, filenamePattern, job.settings)
        : getDefaultFilename(job, job.settings);

      // ZIPにファイルを追加
      await zipWriter.add(filename, job.result.stream());
    }

    // ZIPを閉じる
    const zipBlob = await zipWriter.close();

    // ダウンロードを開始
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;

    // ZIP名を生成（タイムスタンプ付き）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `converted-images-${timestamp}.zip`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('ZIP creation failed:', error);
    // 開発者向け内部メッセージ。ユーザー表示は呼び出し側でロケール別文言に差し替える。
    throw new Error('ZIP creation failed');
  }
}

/**
 * 単一ファイルをダウンロード
 */
export function downloadSingleFile(job: ConversionJob): void {
  if (!job.result) {
    // 開発者向け内部メッセージ。ユーザー表示は呼び出し側でロケール別文言に差し替える。
    throw new Error('No downloadable files');
  }

  const url = URL.createObjectURL(job.result);
  const a = document.createElement('a');
  a.href = url;

  const filename = getDefaultFilename(job, job.settings);
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * ファイルバリデーション機能
 * 仕様: 2.1.1 ファイルアップロード、2.4.3 入力バリデーション
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_EXTENSIONS = ['.heic', '.heif'];
const ALLOWED_MIME_TYPES = ['image/heic', 'image/heif', 'image/heif-sequence'];
const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

/**
 * ファイルの拡張子をチェック
 */
export function validateFileExtension(fileName: string): ValidationResult {
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `対応していない拡張子です。対応形式: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * ファイルのMIMEタイプをチェック
 */
export function validateFileMimeType(file: File): ValidationResult {
  // MIMEタイプが空の場合もあるため、拡張子チェックと併用
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `対応していないファイル形式です。MIMEタイプ: ${file.type}`
    };
  }

  return { valid: true };
}

/**
 * 単一ファイルのバリデーション
 */
export function validateFile(file: File): ValidationResult {
  // 拡張子チェック
  const extensionResult = validateFileExtension(file.name);
  if (!extensionResult.valid) {
    return extensionResult;
  }

  // MIMEタイプチェック（拡張子チェックが通れば、MIMEタイプは参考程度）
  const mimeResult = validateFileMimeType(file);
  if (!mimeResult.valid && file.type) {
    return mimeResult;
  }

  return { valid: true };
}

/**
 * 複数ファイルの合計サイズをチェック
 */
export function validateTotalSize(files: File[]): ValidationResult {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > MAX_TOTAL_SIZE) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `合計ファイルサイズが上限を超えています（${totalMB}MB / ${maxMB}MB）`
    };
  }

  return { valid: true };
}

/**
 * ファイル名のサニタイズ（危険な文字を除去）
 */
export function sanitizeFileName(fileName: string): string {
  // 危険な文字を置換
  return fileName.replace(/[/\\?%*:|"<>]/g, '_');
}

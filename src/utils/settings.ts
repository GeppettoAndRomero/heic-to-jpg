/**
 * 変換設定の型定義とデフォルト値
 * 仕様: 2.1.2 HEIC/HEIF 変換、2.1.3 リサイズ機能、2.1.4 出力形式設定
 */

export type OutputFormat = 'jpeg' | 'png';
export type ResizeMode = 'none' | 'contain' | 'cover';

export interface ConversionSettings {
  // 出力形式
  outputFormat: OutputFormat;

  // JPEG品質 (0.5〜0.98)
  jpegQuality: number;

  // リサイズモード
  resizeMode: ResizeMode;

  // 最大幅（ピクセル）
  maxWidth: number;

  // 最大高さ（ピクセル）
  maxHeight: number;

  // メタデータ保持
  preserveMetadata: boolean;

  // タイムアウト（秒）
  timeout: number;
}

export const DEFAULT_SETTINGS: ConversionSettings = {
  outputFormat: 'jpeg',
  jpegQuality: 0.92,
  resizeMode: 'contain',
  maxWidth: 1920,
  maxHeight: 1080,
  preserveMetadata: false,
  timeout: 30,
};

/**
 * 設定値のバリデーション
 */
export function validateSettings(settings: ConversionSettings): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // JPEG品質チェック
  if (settings.outputFormat === 'jpeg') {
    if (settings.jpegQuality < 0.5 || settings.jpegQuality > 0.98) {
      errors.jpegQuality = 'JPG quality must be between 0.5 and 0.98';
    }
  }

  // 最大幅チェック
  if (settings.maxWidth < 100 || settings.maxWidth > 20000) {
    errors.maxWidth = 'Max width must be between 100 and 20000 pixels';
  }

  // 最大高さチェック
  if (settings.maxHeight < 100 || settings.maxHeight > 20000) {
    errors.maxHeight = 'Max height must be between 100 and 20000 pixels';
  }

  // タイムアウトチェック
  if (settings.timeout < 10 || settings.timeout > 180) {
    errors.timeout = 'Timeout must be between 10 and 180 seconds';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

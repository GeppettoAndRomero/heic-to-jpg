/**
 * 設定の永続化ユーティリティ
 * localStorageを使用して設定を保存・読み込み
 */

import { DEFAULT_SETTINGS, type ConversionSettings } from './settings';

const STORAGE_KEY = 'heic-to-jpg-settings';

/**
 * localStorageから設定を読み込み
 * 保存されていない場合はデフォルト設定を返す
 */
export function loadSettings(): ConversionSettings {
  // SSR時はlocalStorageが存在しないためデフォルト設定を返す
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);

    // デフォルト設定とマージ（新しいフィールドが追加された場合に対応）
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * localStorageに設定を保存
 */
export function saveSettings(settings: ConversionSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('設定の保存に失敗しました:', error);
  }
}

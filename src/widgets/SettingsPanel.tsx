/**
 * SettingsPanel コンポーネント
 * 仕様: 2.1.4 出力形式設定、2.1.3 リサイズ機能、2.2.3 設定パネル
 */

import { useState } from 'preact/hooks';
import type { ConversionSettings, OutputFormat, ResizeMode } from '@/utils/settings';
import { validateSettings } from '@/utils/settings';
import { AppCard } from './AppCard';
import { AppField } from './AppField';
import { ui } from '@/i18n/ui';

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  locale?: string;
}

export function SettingsPanel({ settings, onChange, locale = 'en' }: SettingsPanelProps) {
  const t = (ui as any)[locale] ?? ui.en;
  const [isExpanded, setIsExpanded] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: keyof ConversionSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };

    // バリデーション
    const validation = validateSettings(newSettings);
    setErrors(validation.errors);

    // 設定を更新
    onChange(newSettings);
  };

  return (
    <AppCard>
      <button
        class="settings-panel__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="settings-content"
      >
        <h3 class="settings-panel__title">{t.conversionSettings}</h3>
        <span class="settings-panel__toggle" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div id="settings-content" class="settings-panel__content">
          {/* 出力形式 */}
          <div class="app-field">
            <label class="app-field__label" for="output-format">
              {t.outputFormat}
              <span class="app-field__required">{t.required}</span>
            </label>
            <select
              id="output-format"
              class="app-field__select"
              value={settings.outputFormat}
              onChange={(e) => handleChange('outputFormat', e.currentTarget.value as OutputFormat)}
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          {/* JPEG品質 (JPEGの場合のみ) */}
          {settings.outputFormat === 'jpeg' && (
            <div class="app-field">
              <label class="app-field__label" for="jpeg-quality">
                {t.jpgQuality}
              </label>
              <div class="slider-field">
                <input
                  id="jpeg-quality"
                  type="range"
                  class="slider-field__input"
                  min="50"
                  max="98"
                  step="1"
                  value={Math.round(settings.jpegQuality * 100)}
                  onInput={(e) => handleChange('jpegQuality', Number(e.currentTarget.value) / 100)}
                />
                <span class="slider-field__value num">
                  {Math.round(settings.jpegQuality * 100)}%
                </span>
              </div>
              <div class="app-field__help">
                {t.jpgQualityHelp}
              </div>
              {errors.jpegQuality && (
                <div class="app-field__error" role="alert">
                  <span aria-hidden="true">⚠</span>
                  {errors.jpegQuality}
                </div>
              )}
            </div>
          )}

          {/* リサイズモード */}
          <div class="app-field">
            <label class="app-field__label" for="resize-mode">
              {t.resize}
            </label>
            <select
              id="resize-mode"
              class="app-field__select"
              value={settings.resizeMode}
              onChange={(e) => handleChange('resizeMode', e.currentTarget.value as ResizeMode)}
            >
              <option value="none">{t.resizeNone}</option>
              <option value="contain">{t.resizeContain}</option>
              <option value="cover">{t.resizeCover}</option>
            </select>
            <div class="app-field__help">
              {t.resizeHelpContain}<br />
              {t.resizeHelpCover}
            </div>
          </div>

          {/* 最大幅 */}
          {settings.resizeMode !== 'none' && (
            <AppField
              label={t.maxWidth}
              id="max-width"
              type="number"
              value={settings.maxWidth}
              onChange={(value) => handleChange('maxWidth', value)}
              min={100}
              max={20000}
              step={10}
              error={errors.maxWidth}
              locale={locale}
            />
          )}

          {/* 最大高さ */}
          {settings.resizeMode !== 'none' && (
            <AppField
              label={t.maxHeight}
              id="max-height"
              type="number"
              value={settings.maxHeight}
              onChange={(value) => handleChange('maxHeight', value)}
              min={100}
              max={20000}
              step={10}
              error={errors.maxHeight}
              locale={locale}
            />
          )}

          {/* メタデータ保持 */}
          <div class="app-field">
            <label class="checkbox-field">
              <input
                type="checkbox"
                checked={settings.preserveMetadata}
                onChange={(e) => handleChange('preserveMetadata', e.currentTarget.checked)}
              />
              <span>{t.keepMetadata}</span>
            </label>
            <div class="app-field__help">
              {t.keepMetadataHelp}
            </div>
          </div>

          {/* タイムアウト */}
          <AppField
            label={t.timeout}
            id="timeout"
            type="number"
            value={settings.timeout}
            onChange={(value) => handleChange('timeout', value)}
            min={10}
            max={180}
            step={5}
            helpText={t.timeoutHelp}
            error={errors.timeout}
            locale={locale}
          />
        </div>
      )}
    </AppCard>
  );
}

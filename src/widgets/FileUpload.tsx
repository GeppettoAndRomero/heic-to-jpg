/**
 * FileUpload コンポーネント
 * 仕様: 2.1.1 ファイルアップロード、2.2.2 ドロップゾーン
 */

import { useState, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import { validateFile, validateTotalSize } from '@/utils/fileValidation';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export function FileUpload({ onFilesSelected, maxFiles = 100 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // 各ファイルをバリデーション
    for (const file of fileArray) {
      const result = validateFile(file);
      if (result.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${result.error}`);
      }
    }

    // ファイル数チェック
    if (validFiles.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} files at a time.`);
      return;
    }

    // 合計サイズチェック
    const sizeResult = validateTotalSize(validFiles);
    if (!sizeResult.valid) {
      setError(sizeResult.error || '');
      return;
    }

    // エラーがあれば表示
    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    // 有効なファイルがあれば通知
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragEnter = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // ドロップゾーンの外に出た時だけfalseにする
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    handleFiles(files);

    // 同じファイルを再度選択できるようにリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        class={`file-upload ${isDragging ? 'file-upload--dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
      >
        <div class="file-upload__icon" aria-hidden="true">
          📁
        </div>
        <div class="file-upload__text">
          <p class="file-upload__primary">
            Drop files here, or click to choose
          </p>
          <p class="file-upload__secondary">
            Supported: HEIC, HEIF
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {error && (
        <div class="file-upload__error" role="alert">
          <span aria-hidden="true">⚠</span>
          <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">{error}</pre>
        </div>
      )}
    </div>
  );
}

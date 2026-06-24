/**
 * FileList コンポーネント
 * アップロードされたファイルのリスト表示
 */

import { AppButton } from './AppButton';

interface FileItem {
  file: File;
  id: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div class="file-list">
      <div class="file-list__header">
        <h4 class="file-list__title">Selected files</h4>
        <span class="file-list__count num">{files.length}</span>
      </div>

      <div class="file-list__items">
        {files.map((item) => (
          <div key={item.id} class="file-item">
            <div class="file-item__icon" aria-hidden="true">
              🖼️
            </div>
            <div class="file-item__info">
              <div class="file-item__name" title={item.file.name}>
                {item.file.name}
              </div>
              <div class="file-item__meta">
                <span class="file-item__size num">{formatFileSize(item.file.size)}</span>
                <span>{item.file.type || 'Unknown'}</span>
              </div>
            </div>
            <div class="file-item__remove">
              <AppButton
                variant="ghost"
                onClick={() => onRemove(item.id)}
                ariaLabel={`Remove ${item.file.name}`}
              >
                🗑️
              </AppButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

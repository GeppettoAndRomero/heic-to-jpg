/**
 * FileUploadSection コンポーネント
 * ファイルアップロードとリスト表示を統合
 */

import { useState } from 'preact/hooks';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { AppCard } from './AppCard';

interface FileItem {
  file: File;
  id: string;
}

export function FileUploadSection() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
    }));

    setFiles((prev) => [...prev, ...fileItems]);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppCard
      title="Upload files"
      description="Choose HEIC/HEIF image files."
    >
      <FileUpload onFilesSelected={handleFilesSelected} />
      <FileList files={files} onRemove={handleRemove} />
    </AppCard>
  );
}


import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  errorMessage?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, errorMessage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const borderStyle = isDragging
    ? 'border-indigo-500'
    : errorMessage
    ? 'border-red-500'
    : 'border-slate-600';

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full max-w-xl flex flex-col items-center justify-center p-12 border-2 ${borderStyle} border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700/50 transition-colors duration-300`}
      >
        <UploadIcon />
        <p className="mt-4 text-lg font-semibold text-slate-300">
          <span className="text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-sm text-slate-500">WebP image file only</p>
        <input
          type="file"
          className="hidden"
          accept="image/webp"
          onChange={handleFileChange}
        />
      </label>
      {errorMessage && <p className="mt-4 text-red-400 text-sm font-medium">{errorMessage}</p>}
    </div>
  );
};


import React from 'react';
import type { FileItem } from '../App';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ConversionItemProps {
  item: FileItem;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const StatusPill: React.FC<{ status: FileItem['status'] }> = ({ status }) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Pending</span>;
      case 'converting':
        return <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300"><SpinnerIcon />Converting...</span>;
      case 'converted':
        return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/20 text-green-300">Converted</span>;
      case 'error':
        return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/20 text-red-300">Error</span>;
      default:
        return null;
    }
}

export const ConversionItem: React.FC<ConversionItemProps> = ({ item, onDownload, onRemove }) => {
  return (
    <div className="w-full bg-slate-900/50 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
        <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-md flex items-center justify-center overflow-hidden">
            <img src={item.webpUrl} alt="WebP preview" className="max-w-full max-h-full object-contain" />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate" title={item.file.name}>{item.file.name}</p>
            <p className="text-slate-400 text-sm">{formatBytes(item.file.size)}</p>
        </div>

        <div className="w-32 text-center">
            <StatusPill status={item.status} />
            {item.status === 'error' && <p className="text-red-400 text-xs mt-1 truncate" title={item.error}>{item.error}</p>}
        </div>

        <div className="w-16 h-16 flex-shrink-0 bg-slate-800 rounded-md flex items-center justify-center overflow-hidden">
             {item.status === 'converted' && item.pngUrl ? (
                <img src={item.pngUrl} alt="PNG preview" className="max-w-full max-h-full object-contain" />
            ) : item.status === 'converting' ? (
                <SpinnerIcon />
            ) : (
                <span className="text-slate-500 text-sm">PNG</span>
            )}
        </div>

        <div className="w-24 flex items-center justify-end gap-2">
            {item.status === 'converted' && (
                <button 
                    onClick={() => onDownload(item.id)} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-green-500/20 rounded-full transition-colors"
                    aria-label="Download PNG"
                    title="Download PNG"
                >
                    <DownloadIcon />
                </button>
            )}
            <button 
                onClick={() => onRemove(item.id)}
                className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors"
                aria-label="Remove file"
                title="Remove file"
            >
                <TrashIcon />
            </button>
        </div>
    </div>
  );
};


import React from 'react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ImagePreviewProps {
  webpSrc: string | null;
  pngSrc: string | null;
  isConverting: boolean;
}

const ImageCard: React.FC<{ src: string | null; title: string; isConverting?: boolean; isLoading?: boolean }> = ({ src, title, isLoading = false }) => (
  <div className="flex-1 flex flex-col items-center">
    <h3 className="text-lg font-semibold text-slate-300 mb-3">{title}</h3>
    <div className="w-full h-56 bg-slate-900/50 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
      {isLoading ? (
        <SpinnerIcon />
      ) : src ? (
        <img src={src} alt={title} className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-slate-500">Preview</div>
      )}
    </div>
  </div>
);

export const ImagePreview: React.FC<ImagePreviewProps> = ({ webpSrc, pngSrc, isConverting }) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
      <ImageCard src={webpSrc} title="Original (WebP)" />
      
      <div className="text-slate-500 my-4 md:my-0">
        <ArrowRightIcon />
      </div>

      <ImageCard src={pngSrc} title="Converted (PNG)" isLoading={isConverting} />
    </div>
  );
};


import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';

type Status = 'idle' | 'loaded' | 'converting' | 'converted' | 'error';

const App: React.FC = () => {
  const [webpFile, setWebpFile] = useState<File | null>(null);
  const [webpPreview, setWebpPreview] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Clean up object URLs to prevent memory leaks
    return () => {
      if (webpPreview) {
        URL.revokeObjectURL(webpPreview);
      }
      if (pngUrl) {
        URL.revokeObjectURL(pngUrl);
      }
    };
  }, [webpPreview, pngUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type === 'image/webp') {
      handleReset(); // Reset state before processing new file
      const previewUrl = URL.createObjectURL(file);
      setWebpFile(file);
      setWebpPreview(previewUrl);
      setStatus('loaded');
      setErrorMessage('');
    } else {
      setStatus('error');
      setErrorMessage('Please upload a valid .webp file.');
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!webpPreview || !webpFile) return;

    setStatus('converting');
    const image = new Image();
    image.src = webpPreview;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        setPngUrl(pngDataUrl);
        setStatus('converted');
      } else {
        setStatus('error');
        setErrorMessage('Could not get canvas context to convert image.');
      }
    };

    image.onerror = () => {
      setStatus('error');
      setErrorMessage('Failed to load the image for conversion.');
    };
  }, [webpPreview, webpFile]);
  
  const handleDownload = useCallback(() => {
    if (!pngUrl || !webpFile) return;
    const link = document.createElement('a');
    link.href = pngUrl;
    const fileName = webpFile.name.replace(/\.webp$/, '.png');
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pngUrl, webpFile]);

  const handleReset = useCallback(() => {
    if (webpPreview) {
      URL.revokeObjectURL(webpPreview);
    }
    if (pngUrl) {
      URL.revokeObjectURL(pngUrl);
    }
    setWebpFile(null);
    setWebpPreview(null);
    setPngUrl(null);
    setStatus('idle');
    setErrorMessage('');
  }, [webpPreview, pngUrl]);

  const renderContent = () => {
    switch (status) {
      case 'idle':
      case 'error':
        return <FileUpload onFileSelect={handleFileSelect} errorMessage={errorMessage} />;
      case 'loaded':
      case 'converting':
      case 'converted':
        return (
          <div className="w-full flex flex-col items-center">
            <ImagePreview
              webpSrc={webpPreview}
              pngSrc={pngUrl}
              isConverting={status === 'converting'}
            />
            <div className="mt-8 w-full max-w-md flex justify-center space-x-4">
              {status === 'loaded' && (
                <button
                  onClick={handleConvert}
                  className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800"
                >
                  Convert to PNG
                </button>
              )}
              {status === 'converting' && (
                <div className="flex items-center justify-center w-full bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed">
                  <SpinnerIcon />
                  Converting...
                </div>
              )}
              {status === 'converted' && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center w-1/2 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-800"
                  >
                    <DownloadIcon />
                    Download PNG
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-1/2 bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800"
                  >
                    Convert Another
                  </button>
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            WebP to PNG Converter
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Instantly convert your WebP images to PNG format right in your browser.
          </p>
        </header>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-10 min-h-[300px] flex items-center justify-center transition-all duration-300">
          {renderContent()}
        </div>
        <footer className="text-center mt-10 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WebP to PNG Converter. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;

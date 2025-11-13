
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConversionItem } from './components/ConversionItem';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

export interface FileItem {
  id: string;
  file: File;
  webpUrl: string;
  pngUrl: string | null;
  status: 'pending' | 'converting' | 'converted' | 'error';
  error?: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [globalError, setGlobalError] = useState<string>('');

  // This ref will hold the latest files array, allowing the unmount cleanup
  // effect to access it without needing `files` in its dependency array.
  const filesRef = useRef(files);
  filesRef.current = files;

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    setGlobalError('');
    const newValidFiles: FileItem[] = [];
    const invalidFiles: File[] = [];

    Array.from(selectedFiles).forEach(file => {
      if (file.type === 'image/webp') {
        newValidFiles.push({
          id: crypto.randomUUID(),
          file,
          webpUrl: URL.createObjectURL(file),
          pngUrl: null,
          status: 'pending',
        });
      } else {
        invalidFiles.push(file);
      }
    });

    if (newValidFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...newValidFiles]);
    }
    
    if (invalidFiles.length > 0) {
        setGlobalError(`Skipped ${invalidFiles.length} non-WebP file(s). Please upload valid .webp files.`);
    }
  }, []);

  const handleConvertAll = useCallback(async () => {
    const filesToConvert = files.filter(f => f.status === 'pending');
    if (filesToConvert.length === 0) return;

    setIsConvertingAll(true);

    for (const item of filesToConvert) {
      // Mark current file as converting
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'converting' } : f));

      try {
        const pngDataUrl = await new Promise<string>((resolve, reject) => {
          const image = new Image();
          image.src = item.webpUrl;

          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(image, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              reject(new Error('Canvas context error.'));
            }
          };

          image.onerror = () => {
            reject(new Error('Image load failed.'));
          };
        });
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'converted', pngUrl: pngDataUrl } : f));
      } catch (error: any) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', error: error.message || 'Conversion failed.' } : f));
      }
    }

    setIsConvertingAll(false);
  }, [files]);

  const handleDownload = useCallback((id: string) => {
    const item = files.find(f => f.id === id);
    if (!item || !item.pngUrl) return;
    
    const link = document.createElement('a');
    link.href = item.pngUrl;
    const fileName = item.file.name.replace(/\.webp$/, '.png');
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [files]);

  const handleRemove = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.webpUrl);
        if (fileToRemove.pngUrl) {
          URL.revokeObjectURL(fileToRemove.pngUrl);
        }
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);
  
  const handleClearAll = useCallback(() => {
    files.forEach(file => {
        URL.revokeObjectURL(file.webpUrl);
        if (file.pngUrl) {
            URL.revokeObjectURL(file.pngUrl);
        }
    });
    setFiles([]);
    setGlobalError('');
  }, [files]);
  
  useEffect(() => {
    return () => {
      // Cleanup object URLs on component unmount to prevent memory leaks
      filesRef.current.forEach(file => {
        URL.revokeObjectURL(file.webpUrl);
        if (file.pngUrl) {
          URL.revokeObjectURL(file.pngUrl);
        }
      });
    };
  }, []); // Empty dependency array ensures this effect only runs on mount and unmount

  const hasPendingFiles = files.some(f => f.status === 'pending');

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            WebP to PNG Converter
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Instantly convert your WebP images to PNG format right in your browser. Supports multiple files.
          </p>
        </header>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
            {files.length === 0 ? (
                 <FileUpload onFileSelect={handleFileSelect} errorMessage={globalError} />
            ) : (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full space-y-4">
                        {files.map(item => (
                            <ConversionItem key={item.id} item={item} onDownload={handleDownload} onRemove={handleRemove} />
                        ))}
                    </div>

                    <div className="mt-8 w-full border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:w-auto">
                           <FileUpload onFileSelect={handleFileSelect} compact/>
                           {globalError && <p className="mt-2 text-red-400 text-xs text-center sm:text-left">{globalError}</p>}
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleClearAll}
                                className="bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isConvertingAll}
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleConvertAll}
                                className="w-48 flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!hasPendingFiles || isConvertingAll}
                            >
                                {isConvertingAll ? <><SpinnerIcon /> Converting...</> : 'Convert All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <footer className="text-center mt-10 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WebP to PNG Converter. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;

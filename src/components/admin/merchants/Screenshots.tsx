'use client';

import { useState, useRef } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ScreenshotData {
  desktopImages: File[];
  mobileImages: File[];
}

interface ScreenshotsProps {
  initialScreenshots?: string[];
  onScreenshotsChange?: (data: ScreenshotData) => void;
}

interface ImagePreview {
  file: File;
  preview: string;
  error?: string;
}

export default function Screenshots({ initialScreenshots, onScreenshotsChange }: ScreenshotsProps = {}) {
  const [desktopPreviews, setDesktopPreviews] = useState<ImagePreview[]>([]);
  const [mobilePreviews, setMobilePreviews] = useState<ImagePreview[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(initialScreenshots || []);

  // Track current valid files and notify parent whenever they change
  const currentDesktopFiles = useRef<File[]>([]);
  const currentMobileFiles = useRef<File[]>([]);

  const validateImage = (
    file: File,
    expectedRatio: number,
    maxSize: number,
    toleranceRatio: number = 0.1
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.size > maxSize) {
        resolve(`File size must be less than ${maxSize / 1024}KB`);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (Math.abs(aspectRatio - expectedRatio) > toleranceRatio) {
          resolve(`Incorrect aspect ratio. Expected ${expectedRatio.toFixed(2)}:1, got ${aspectRatio.toFixed(2)}:1`);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve('Invalid image file');

      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper to notify parent with current files
  const notifyParent = () => {
    console.log('Notifying parent with current files:', {
      desktop: currentDesktopFiles.current.length,
      mobile: currentMobileFiles.current.length,
      desktopFiles: currentDesktopFiles.current.map(f => ({ name: f.name, size: f.size })),
      mobileFiles: currentMobileFiles.current.map(f => ({ name: f.name, size: f.size }))
    });

    onScreenshotsChange?.({
      desktopImages: [...currentDesktopFiles.current],
      mobileImages: [...currentMobileFiles.current]
    });
  };

  // Update current files and notify parent
  const updateFiles = (newDesktopPreviews?: ImagePreview[], newMobilePreviews?: ImagePreview[]) => {
    if (newDesktopPreviews !== undefined) {
      console.log("desktop");
      
      currentDesktopFiles.current = newDesktopPreviews.filter(p => !p.error).map(p => p.file);
    }
    if (newMobilePreviews !== undefined) {
      console.log("mobile");
      console.log(newMobilePreviews.filter(p => p));
      
      currentMobileFiles.current = newMobilePreviews.filter(p => !p.error).map(p => p.file);
    }

    notifyParent();
  };

  const handleDesktopImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Desktop input: selected', files.length, 'files:', files.map(f => ({ name: f.name, size: f.size })));

    if (desktopPreviews.length + files.length > 5) {
      alert('Maximum 5 desktop screenshots allowed');
      return;
    }

    const newPreviews: ImagePreview[] = [];

    for (const file of files) {
      const error = await validateImage(file, 16/10, 300 * 1024); // 16:10 ratio, 300KB
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = () => {
          newPreviews.push({
            file,
            preview: reader.result as string,
            error: error || undefined
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    const updatedPreviews = [...desktopPreviews, ...newPreviews];
    setDesktopPreviews(updatedPreviews);

    console.log('Desktop previews updated:', updatedPreviews.length);
    updateFiles(updatedPreviews, undefined);

    // Clear input for potential re-upload
    e.target.value = '';
  };

  const handleMobileImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Mobile input: selected', files.length, 'files:', files.map(f => ({ name: f.name, size: f.size })));

    if (mobilePreviews.length + files.length > 5) {
      alert('Maximum 5 mobile screenshots allowed');
      return;
    }

    const newPreviews: ImagePreview[] = [];

    for (const file of files) {
      const error = await validateImage(file, 9/16, 300 * 1024); // 9:16 ratio, 300KB
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = () => {
          newPreviews.push({
            file,
            preview: reader.result as string,
            error: error || undefined
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    const updatedPreviews = [...mobilePreviews, ...newPreviews];
    setMobilePreviews(updatedPreviews);

    console.log('Mobile previews updated:', updatedPreviews.length);
    updateFiles(undefined, updatedPreviews);

    // Clear input for potential re-upload
    e.target.value = '';
  };

  const removeDesktopImage = (index: number) => {
    const updatedPreviews = desktopPreviews.filter((_, i) => i !== index);
    setDesktopPreviews(updatedPreviews);
    updateFiles(updatedPreviews, undefined);
  };

  const removeMobileImage = (index: number) => {
    const updatedPreviews = mobilePreviews.filter((_, i) => i !== index);
    setMobilePreviews(updatedPreviews);
    updateFiles(undefined, updatedPreviews);
  };

  const removeExistingScreenshot = (index: number) => {
    const updatedScreenshots = existingScreenshots.filter((_, i) => i !== index);
    setExistingScreenshots(updatedScreenshots);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Screenshots</h3>
      </div>
      <div className="px-6 py-4 space-y-8">

        {/* Desktop Screenshots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Desktop Images</h4>
            <span className="text-sm text-gray-500">
              {desktopPreviews.length}/5 images
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Aspect ratio 16:10, Recommended: 1280×800px, Max: 300KB each
          </div>

          {/* Desktop Upload Area */}
          <div className="border-2 border-gray-300 border-dashed rounded-md p-6 mb-4">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="desktop-upload" className="cursor-pointer bg-white rounded-md font-medium text-[#A96B11] hover:text-[#8b5a0e]">
                  <span>Upload desktop screenshots</span>
                  <input
                    id="desktop-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleDesktopImages}
                    disabled={desktopPreviews.length >= 5}
                  />
                </label>
                <p className="text-gray-500">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 300KB each</p>
            </div>
          </div>

          {/* Existing Screenshots */}
          {existingScreenshots.length > 0 && (
            <>
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Current Screenshots</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingScreenshots.map((screenshot, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden">
                        <OptimizedImage
                          src={screenshot}
                          alt={`Existing screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                          sizeType="card"
                          qualityPriority="medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Desktop Preview Grid */}
          {desktopPreviews.length > 0 && (
            <>
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">New Desktop Screenshots</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {desktopPreviews.map((imagePreview, index) => (
                    <div key={index} className="relative group">
                      <div className={`aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        imagePreview.error
                          ? 'border-red-500 shadow-red-200 shadow-md'
                          : 'border-green-500 shadow-green-200 shadow-md'
                      }`}>
                        <OptimizedImage
                          src={imagePreview.preview}
                          alt={`Desktop screenshot ${index + 1}`}
                          fill
                          className={`object-cover transition-all duration-200 ${
                            imagePreview.error ? 'opacity-40 grayscale' : 'opacity-100'
                          }`}
                          sizeType="card"
                          qualityPriority="medium"
                        />

                        {/* Visual status overlay */}
                        {imagePreview.error ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-25">
                            <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg max-w-[90%] text-center">
                              <div className="flex flex-col items-center space-y-1">
                                <span className="text-2xl">
                                  {imagePreview.error.includes('size') ? '📏' :
                                   imagePreview.error.includes('ratio') ? '📐' : '⚠️'}
                                </span>
                                <span className="font-medium text-sm">
                                  {imagePreview.error.includes('size') ? 'File Too Large' :
                                   imagePreview.error.includes('ratio') ? 'Wrong Aspect Ratio' : 'Invalid Image'}
                                </span>
                                <span className="text-xs opacity-90">
                                  {imagePreview.error.includes('size') ? 'Max 300KB' :
                                   imagePreview.error.includes('ratio') ? 'Need 16:10' : 'See details below'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                            <span className="text-sm">✓</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeDesktopImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        ×
                      </button>

                      {/* Error details */}
                      {imagePreview.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-700 font-medium flex items-start">
                            <span className="mr-1">⚠️</span>
                            {imagePreview.error}
                          </p>
                        </div>
                      )}

                      {/* Success indicator */}
                      {!imagePreview.error && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-700 font-medium flex items-center">
                            <span className="mr-1">✅</span>
                            Ready to upload
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Screenshots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Mobile Images</h4>
            <span className="text-sm text-gray-500">
              {mobilePreviews.length}/5 images
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Aspect ratio 9:16, Recommended: 480×853px, Max: 300KB each
          </div>

          {/* Mobile Upload Area */}
          <div className="border-2 border-gray-300 border-dashed rounded-md p-6 mb-4">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="mobile-upload" className="cursor-pointer bg-white rounded-md font-medium text-[#A96B11] hover:text-[#8b5a0e]">
                  <span>Upload mobile screenshots</span>
                  <input
                    id="mobile-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleMobileImages}
                    disabled={mobilePreviews.length >= 5}
                  />
                </label>
                <p className="text-gray-500">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 300KB each</p>
            </div>
          </div>

          {/* Mobile Preview Grid */}
          {mobilePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {mobilePreviews.map((imagePreview, index) => (
                <div key={index} className="relative group">
                  <div className={`aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    imagePreview.error
                      ? 'border-red-500 shadow-red-200 shadow-md'
                      : 'border-green-500 shadow-green-200 shadow-md'
                  }`}>
                    <OptimizedImage
                      src={imagePreview.preview}
                      alt={`Mobile screenshot ${index + 1}`}
                      fill
                      className={`object-cover transition-all duration-200 ${
                        imagePreview.error ? 'opacity-40 grayscale' : 'opacity-100'
                      }`}
                      sizeType="card"
                      qualityPriority="medium"
                    />

                    {/* Visual status overlay */}
                    {imagePreview.error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-25">
                        <div className="bg-red-500 text-white p-2 rounded-lg shadow-lg max-w-[90%] text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg">
                              {imagePreview.error.includes('size') ? '📏' :
                               imagePreview.error.includes('ratio') ? '📐' : '⚠️'}
                            </span>
                            <span className="font-medium text-xs">
                              {imagePreview.error.includes('size') ? 'File Too Large' :
                               imagePreview.error.includes('ratio') ? 'Wrong Aspect Ratio' : 'Invalid Image'}
                            </span>
                            <span className="text-xs opacity-90">
                              {imagePreview.error.includes('size') ? 'Max 300KB' :
                               imagePreview.error.includes('ratio') ? 'Need 9:16' : 'See details below'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full shadow-lg">
                        <span className="text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMobileImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    ×
                  </button>

                  {/* Error details */}
                  {imagePreview.error && (
                    <div className="mt-2 p-1.5 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs text-red-700 font-medium flex items-start">
                        <span className="mr-1">⚠️</span>
                        {imagePreview.error}
                      </p>
                    </div>
                  )}

                  {/* Success indicator */}
                  {!imagePreview.error && (
                    <div className="mt-2 p-1.5 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700 font-medium flex items-center">
                        <span className="mr-1">✅</span>
                        Ready
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
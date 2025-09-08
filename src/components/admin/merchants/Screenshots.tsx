'use client';

import { useState } from 'react';

interface ScreenshotData {
  desktopImages: File[];
  mobileImages: File[];
}

interface ScreenshotsProps {
  onScreenshotsChange?: (data: ScreenshotData) => void;
}

interface ImagePreview {
  file: File;
  preview: string;
  error?: string;
}

export default function Screenshots({ onScreenshotsChange }: ScreenshotsProps = {}) {
  const [desktopPreviews, setDesktopPreviews] = useState<ImagePreview[]>([]);
  const [mobilePreviews, setMobilePreviews] = useState<ImagePreview[]>([]);

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

      const img = new Image();
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

  const handleDesktopImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
    
    const validFiles = updatedPreviews.filter(p => !p.error).map(p => p.file);
    onScreenshotsChange?.({
      desktopImages: validFiles,
      mobileImages: mobilePreviews.filter(p => !p.error).map(p => p.file)
    });
  };

  const handleMobileImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
    
    const validFiles = updatedPreviews.filter(p => !p.error).map(p => p.file);
    onScreenshotsChange?.({
      desktopImages: desktopPreviews.filter(p => !p.error).map(p => p.file),
      mobileImages: validFiles
    });
  };

  const removeDesktopImage = (index: number) => {
    const updatedPreviews = desktopPreviews.filter((_, i) => i !== index);
    setDesktopPreviews(updatedPreviews);
    
    const validFiles = updatedPreviews.filter(p => !p.error).map(p => p.file);
    onScreenshotsChange?.({
      desktopImages: validFiles,
      mobileImages: mobilePreviews.filter(p => !p.error).map(p => p.file)
    });
  };

  const removeMobileImage = (index: number) => {
    const updatedPreviews = mobilePreviews.filter((_, i) => i !== index);
    setMobilePreviews(updatedPreviews);
    
    const validFiles = updatedPreviews.filter(p => !p.error).map(p => p.file);
    onScreenshotsChange?.({
      desktopImages: desktopPreviews.filter(p => !p.error).map(p => p.file),
      mobileImages: validFiles
    });
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

          {/* Desktop Preview Grid */}
          {desktopPreviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {desktopPreviews.map((imagePreview, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview.preview}
                      alt={`Desktop screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDesktopImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {imagePreview.error && (
                    <p className="text-xs text-red-600 mt-1">{imagePreview.error}</p>
                  )}
                </div>
              ))}
            </div>
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
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview.preview}
                      alt={`Mobile screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMobileImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {imagePreview.error && (
                    <p className="text-xs text-red-600 mt-1">{imagePreview.error}</p>
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
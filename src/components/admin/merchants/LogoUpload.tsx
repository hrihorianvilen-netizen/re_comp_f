'use client';

import Image from 'next/image';

interface LogoUploadProps {
  logoPreview: string;
  setLogoPreview: (preview: string) => void;
  onLogoChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

export default function LogoUpload({ logoPreview, setLogoPreview, onLogoChange, error, required = false }: LogoUploadProps) {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoChange(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoPreview('');
    onLogoChange(null);
  };

  return (
    <div className="w-1/5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Logo {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`mt-1 flex justify-center px-4 pt-4 pb-4 border-2 ${error ? 'border-red-300' : 'border-gray-300'} border-dashed rounded-md`}>
        <div className="space-y-1 text-center">
          {logoPreview ? (
            <div className="relative">
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={64}
                height={64}
                className="mx-auto h-16 w-16 object-cover rounded-lg"
                style={{ aspectRatio: '1/1' }}
              />
              <button
                type="button"
                onClick={clearLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-xs text-gray-600">
                <label
                  htmlFor="logo-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#A96B11] hover:text-[#8b5a0e] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#A96B11]"
                >
                  <span>Upload</span>
                  <input
                    id="logo-upload"
                    name="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG</p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
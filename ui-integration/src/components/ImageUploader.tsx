import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, Camera } from 'lucide-react';
import { ModalityType } from '../types';
import { PhotoGuide } from './PhotoGuide';

interface ImageUploaderProps {
  modality: ModalityType;
  onImageSelected: (imageDataUrl: string, source: 'upload') => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  modality,
  onImageSelected,
  onOpenCamera,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setErrorMessage(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        'Invalid file format. Please upload an image (JPEG, PNG, or WebP).'
      );
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        'The selected image is too large (maximum allowed size is 10MB).'
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result, 'upload');
      }
    };

    reader.onerror = () => {
      setErrorMessage(
        'Failed to read image file. Please try selecting a different file.'
      );
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleBrowseClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleCameraClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    onOpenCamera();
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload and Camera Options */}
      <div className="space-y-3">
        {/* Drag & Drop Card */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl p-7 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden group ${
            dragActive
              ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Upload Icon */}
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          {/* Heading */}
          <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
            Upload your {modality} image
          </h4>

          {/* Description */}
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Select a clear photo from your device. Supported formats:
            JPEG, PNG, WebP (up to 10MB).
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Browse Files */}
            <button
              type="button"
              onClick={handleBrowseClick}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Browse Files
            </button>

            {/* Camera */}
            <button
              type="button"
              onClick={handleCameraClick}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Use Device Camera</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Photo Guide */}
      <PhotoGuide modality={modality} />
    </div>
  );
};

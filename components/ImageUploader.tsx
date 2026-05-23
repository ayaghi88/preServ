
import React, { useCallback } from 'react';
import { ReferenceImage } from '../types';

interface ImageUploaderProps {
  images: ReferenceImage[];
  onImagesChange: (images: ReferenceImage[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, maxImages = 5 }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // FIX: Cast to File[] to avoid 'unknown' type errors on file.type and reader.readAsDataURL
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    // FIX: Process all files as Promises and update state once to avoid race conditions in the forEach loop
    const uploadPromises = files.map(file => {
      return new Promise<ReferenceImage>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          if (data) {
            resolve({
              id: Math.random().toString(36).substring(2, 11),
              data,
              mimeType: file.type
            });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(newImages => {
      onImagesChange([...images, ...newImages]);
    });
  }, [images, onImagesChange, maxImages]);

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Reference Images ({images.length}/{maxImages})</label>
        {images.length < maxImages && (
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          </label>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {images.length === 0 ? (
          <div className="col-span-5 h-32 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Upload images of the subject</span>
          </div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700 shadow-lg">
              <img src={img.data} alt="Reference" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ImageUploader;

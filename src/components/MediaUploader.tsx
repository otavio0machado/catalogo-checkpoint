'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { MediaItem } from '@/types';

interface MediaUploaderProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

const MAX_IMAGES = 2;

export default function MediaUploader({ items, onChange }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const imageCount = items.filter((i) => i.type === 'image').length;
  const canAddMore = imageCount < MAX_IMAGES;

  async function resizeImage(file: File): Promise<{ blob: Blob; base64: string }> {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);
      const cleanup = () => URL.revokeObjectURL(objectUrl);

      img.onerror = () => {
        cleanup();
        reject(new Error('Não foi possível ler a imagem. Tente outro arquivo.'));
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE;
            width = MAX_SIZE;
          } else {
            width = (width / height) * MAX_SIZE;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Falha ao processar a imagem.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              reject(new Error('Falha ao comprimir a imagem.'));
              return;
            }
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Falha ao ler a imagem comprimida.'));
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({ blob, base64 });
            };
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = objectUrl;
    });
  }

  async function uploadFile(file: File): Promise<MediaItem | null> {
    const { blob } = await resizeImage(file);

    const formData = new FormData();
    formData.append('file', blob, file.name);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro no upload');
    }

    const { path, url, type } = await res.json();

    return { url, type, path };
  }

  async function handleFiles(files: FileList) {
    setError('');
    setUploading(true);

    const newItems: MediaItem[] = [];
    let currentImages = imageCount;

    for (const file of Array.from(files)) {
      if (file.type.startsWith('video/')) {
        setError('Apenas fotos são permitidas.');
        continue;
      }
      if (currentImages >= MAX_IMAGES) {
        setError(`Máximo ${MAX_IMAGES} fotos por anúncio.`);
        continue;
      }

      try {
        const item = await uploadFile(file);
        if (item) {
          newItems.push(item);
          currentImages++;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro no upload');
      }
    }

    if (newItems.length > 0) {
      onChange([...items, ...newItems]);
    }
    setUploading(false);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  }

  return (
    <div>
      {/* Grid of uploaded items */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-2 mb-3">
          {items.map((item, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/10">
              <Image src={item.url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-brand-400 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Capa
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label={`Remover foto ${i + 1}`}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/80"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Add more button */}
          {canAddMore && !uploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-warm-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] mt-1">Adicionar</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !uploading && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-white/20 rounded-2xl"
        >
          <div className="py-8 flex flex-col items-center justify-center text-warm-400 px-4">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-warm-400 mb-1">Adicione fotos</p>
            <p className="text-xs text-warm-400 mb-4">Até {MAX_IMAGES} fotos</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-400 text-white rounded-lg text-sm font-medium hover:bg-brand-300 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Tirar foto
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] text-warm-200 rounded-lg text-sm font-medium hover:bg-warm-200 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Escolher arquivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {uploading && items.length === 0 && (
        <div className="border-2 border-dashed border-white/20 rounded-2xl py-10 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Action buttons when items exist */}
      {items.length > 0 && canAddMore && !uploading && (
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-brand-300 bg-brand-400/10 rounded-lg hover:bg-brand-400/20 active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tirar foto
          </button>
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && items.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-brand-600 mt-2">
          <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          Enviando...
        </div>
      )}

      {/* Hidden inputs */}
      {/* File picker (gallery) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
      {/* Camera capture (photo) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <p className="text-xs text-warm-400 mt-2">
        {imageCount}/{MAX_IMAGES} fotos
      </p>
    </div>
  );
}

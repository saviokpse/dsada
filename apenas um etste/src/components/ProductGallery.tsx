import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Snowflake, X } from 'lucide-react';
import { ProductImage } from '../types/store';

interface ProductGalleryProps {
  images: ProductImage[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = images[selectedIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const goPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-3.5 items-start">
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible w-full md:w-20 shrink-0 pb-1 md:pb-0">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            const hasFailed = failedIds[img.id];
            return (
              <button
                key={img.id}
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => setSelectedIndex(idx)}
                className={`w-16 h-16 md:w-18 md:h-18 rounded-lg border-2 overflow-hidden bg-white shrink-0 transition-all cursor-pointer flex items-center justify-center p-1 ${
                  isSelected
                    ? 'border-[#0086FF] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                title={img.label}
              >
                {!hasFailed ? (
                  <img
                    src={img.src}
                    alt={img.alt}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedIds((prev) => ({ ...prev, [img.id]: true }))}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                    <Snowflake className="w-5 h-5 text-[#0086FF]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 w-full relative bg-white rounded-xl border border-slate-200 overflow-hidden group">
          <div
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
            className="aspect-square w-full flex items-center justify-center p-4 sm:p-6 cursor-zoom-in overflow-hidden relative"
          >
            {!failedIds[activeImage.id] ? (
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedIds((prev) => ({ ...prev, [activeImage.id]: true }))
                }
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        transform: 'scale(1.65)',
                      }
                    : undefined
                }
                className="w-full h-full object-contain transition-transform duration-150 ease-out select-none"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center">
                <Snowflake className="w-14 h-14 text-[#0086FF] mb-3" />
                <span className="text-sm font-bold text-slate-800">{activeImage.label}</span>
                <span className="text-xs text-slate-500 mt-1">
                  Gree G-Top Auto Inverter 9.000 BTUs
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#0086FF] cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#0086FF] cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-md bg-white/90 border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5 hover:text-[#0086FF] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ampliar</span>
            </button>
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
            <span>{activeImage.label}</span>
            <span className="tabular-nums font-medium">
              Foto {selectedIndex + 1} de {images.length}
            </span>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-800">{activeImage.label}</span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-square max-h-[70vh] mx-auto flex items-center justify-center relative">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

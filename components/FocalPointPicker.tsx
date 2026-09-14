'use client'

import { useRef, useCallback } from 'react'

interface FocalPointPickerProps {
  imageUrl: string
  posX: number
  posY: number
  onChange: (x: number, y: number) => void
}

// Adminin bir fotoğrafın kare/dikdörtgen kırpımlarda hangi bölümünün öncelikli gösterileceğini
// (odak noktasını) seçmesini sağlar. Gerçek piksel kırpma yapmıyor - tek bir odak noktası
// (object-position yüzdesi) saklıyor, bu değer fotoğrafın gösterildiği her yerde (liste, kart,
// detay sayfası) farklı en-boy oranlarında tutarlı bir şekilde uygulanıyor.
export default function FocalPointPicker({ imageUrl, posX, posY, onChange }: FocalPointPickerProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const draggingRef = useRef(false)

  const setFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = imgRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    onChange(Math.round(x * 10) / 10, Math.round(y * 10) / 10)
  }, [onChange])

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromPointer(e.clientX, e.clientY)
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!draggingRef.current) return
    setFromPointer(e.clientX, e.clientY)
  }
  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    draggingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  if (!imageUrl) return null

  return (
    <div className="space-y-3">
      <label className="block text-white mb-1 text-sm font-medium">Fotoğrafta odak noktası seç</label>
      <p className="text-white/40 text-xs mb-2">Fotoğrafın üstüne tıkla veya sürükle — kare/dikdörtgen alanlarda öncelikle bu nokta görünecek.</p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-64 flex-shrink-0 select-none">
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-auto rounded-lg block cursor-crosshair border border-white/20"
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: `${posX}%`,
              top: `${posY}%`,
              transform: 'translate(-50%,-50%)',
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 0 0 1.5px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.5)',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div className="flex gap-4">
          <div>
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/20 bg-navy-900/50">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${posX}% ${posY}%` }} />
            </div>
            <p className="text-white/40 text-[10px] mt-1 text-center">Kare önizleme</p>
          </div>
          <div>
            <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/20 bg-navy-900/50">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${posX}% ${posY}%` }} />
            </div>
            <p className="text-white/40 text-[10px] mt-1 text-center">Dikey önizleme</p>
          </div>
        </div>
      </div>
    </div>
  )
}

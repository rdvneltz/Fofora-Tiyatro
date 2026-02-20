'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertTriangle, Copy, Check } from 'lucide-react'
import axios from 'axios'

interface ImageUploaderProps {
  currentUrl?: string
  onUrlChange: (url: string) => void
  label?: string
  folder?: string
  acceptVideo?: boolean
}

export default function ImageUploader({
  currentUrl = '',
  onUrlChange,
  label = 'Fotoğraf',
  folder = 'images',
  acceptVideo = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [manualUrl, setManualUrl] = useState(currentUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(currentUrl)
  const [imageError, setImageError] = useState(false)
  const [copied, setCopied] = useState(false)

  // Keep the local blob preview separate from the remote URL
  const localPreviewRef = useRef<string>('')
  const uniqueId = useRef(`file-upload-${folder}-${Math.random().toString(36).slice(2, 8)}`)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImageError(false)
      // Create local preview from file data
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        localPreviewRef.current = dataUrl
        setPreview(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setImageError(false)

    try {
      // Get presigned URL
      const presignedRes = await axios.post('/api/upload/presigned-url', {
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        folder
      })

      const { presignedUrl, publicUrl } = presignedRes.data
      setUploadProgress(10)

      // Upload to R2
      await axios.put(presignedUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(10 + Math.round((percentCompleted * 90) / 100))
          }
        }
      })

      setUploadProgress(100)

      // Pass the public URL to parent for database storage
      onUrlChange(publicUrl)
      setManualUrl(publicUrl)

      // IMPORTANT: Keep the local data URL as preview - don't switch to remote URL
      // This ensures the preview always works even if R2 public URL has issues
      // The preview stays as the local file data URL
      if (!localPreviewRef.current) {
        setPreview(publicUrl)
      }
      // If we have a local preview, keep it instead of switching to remote

      setTimeout(() => {
        setUploadProgress(0)
        setSelectedFile(null)
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Yükleme başarısız oldu. Lütfen tekrar deneyin.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url)
    setPreview(url)
    localPreviewRef.current = ''
    setImageError(false)
    onUrlChange(url)
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreview('')
    setManualUrl('')
    localPreviewRef.current = ''
    setImageError(false)
    onUrlChange('')
  }

  const copyUrl = () => {
    if (manualUrl) {
      navigator.clipboard.writeText(manualUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleImageError = () => {
    // If remote URL fails but we have a local preview, use it
    if (localPreviewRef.current && preview !== localPreviewRef.current) {
      setPreview(localPreviewRef.current)
    } else {
      setImageError(true)
    }
  }

  const accept = acceptVideo ? 'image/*,video/*' : 'image/*'
  const isVideo = preview && (
    preview.startsWith('data:video') ||
    preview.endsWith('.mp4') ||
    preview.endsWith('.webm') ||
    (acceptVideo && selectedFile?.type?.startsWith('video/'))
  )

  return (
    <div className="space-y-4">
      <label className="block text-white mb-2 text-sm font-medium">{label}</label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video bg-navy-900/50 rounded-lg overflow-hidden border border-white/10">
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-red-400 text-sm font-medium">Görsel yüklenemedi</p>
              <p className="text-white/40 text-xs px-4 text-center break-all max-w-full">{manualUrl}</p>
              <button
                type="button"
                onClick={copyUrl}
                className="mt-1 flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white/60 text-xs transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Kopyalandı' : 'URL Kopyala'}
              </button>
            </div>
          ) : isVideo ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              controls
              onError={handleImageError}
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Upload success + URL info */}
      {manualUrl && !uploading && uploadProgress === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
          <div className="flex-1 text-white/40 text-xs truncate">{manualUrl}</div>
          <button
            type="button"
            onClick={copyUrl}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            title="URL Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
          </button>
        </div>
      )}

      {/* File Upload */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={uniqueId.current}
          />
          <label
            htmlFor={uniqueId.current}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <ImageIcon className="w-5 h-5" />
            {selectedFile ? selectedFile.name : 'Dosya Seç'}
          </label>
        </div>
        {selectedFile && (
          <button
            type="button"
            onClick={uploadFile}
            disabled={uploading}
            className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Yükle
              </>
            )}
          </button>
        )}
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20"></div>
        <span className="text-white/40 text-sm">VEYA</span>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      {/* Manual URL Input */}
      <input
        type="text"
        value={manualUrl}
        onChange={(e) => handleManualUrlChange(e.target.value)}
        placeholder="URL girin (https://...)"
        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
      />
    </div>
  )
}

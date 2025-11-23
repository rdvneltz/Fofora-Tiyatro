'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

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
      onUrlChange(publicUrl)
      setManualUrl(publicUrl)
      setPreview(publicUrl)

      setTimeout(() => {
        setUploadProgress(0)
        setSelectedFile(null)
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Yükleme başarısız oldu')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url)
    setPreview(url)
    onUrlChange(url)
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreview('')
    setManualUrl('')
    onUrlChange('')
  }

  const accept = acceptVideo ? 'image/*,video/*' : 'image/*'
  const isVideo = preview && (preview.endsWith('.mp4') || preview.endsWith('.webm') || preview.includes('video'))

  return (
    <div className="space-y-4">
      <label className="block text-white mb-2 text-sm font-medium">{label}</label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video bg-navy-900/50 rounded-lg overflow-hidden border border-white/10">
          {isVideo ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
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

      {/* File Upload */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${folder}`}
          />
          <label
            htmlFor={`file-upload-${folder}`}
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

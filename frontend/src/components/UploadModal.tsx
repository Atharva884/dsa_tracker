'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileSpreadsheet, AlertCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => Promise<void>
}

export function UploadModal({ open, onOpenChange, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.includes('sheet') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      await onUpload(file)
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setDragActive(false)
    setIsUploading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetModal()
    }}>
      <DialogContent className="sm:max-w-[500px] supabase-card shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Upload className="w-5 h-5 text-emerald-400" />
            Upload Problem List
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Upload an Excel file with your DSA problems to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Format Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-300 mb-2">Excel File Format</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Column 1: <strong>title</strong> - Problem name</li>
                  <li>• Column 2: <strong>link</strong> - Problem URL</li>
                  <li>• Supported formats: .xls, .xlsx</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Duplicates will be automatically skipped</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-emerald-500 bg-emerald-500/10'
                : file
                ? 'border-green-400 bg-green-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <FileSpreadsheet className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-green-300">{file.name}</p>
                  <p className="text-sm text-green-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">
                    Drop your Excel file here
                  </p>
                  <p className="text-sm text-gray-400">
                    or click to browse files
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                  style={{ background: 'transparent' }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="supabase-button-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="supabase-button-primary"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Problems
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
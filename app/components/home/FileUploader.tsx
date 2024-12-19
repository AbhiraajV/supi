'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, FileText, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FilesAccordion } from './FileList/FilesAccordion'
import { uploadToVectorStore } from '@/app/actions/vector-store.action'

interface FileUploaderProps {
  vectorStoreId: string
}

export function FileUploader({ vectorStoreId }: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
    }
  })

  const handleUpload = async () => {
    setUploading(true)
    try {
      await uploadToVectorStore(selectedFiles,vectorStoreId)
      setSelectedFiles([])
    } catch (error) {
      console.error('Error uploading files:', error)
    }
    setUploading(false)
  }

  const handleDeleteFile = (file: File) => {
    setFileToDelete(file)
  }

  const confirmDelete = () => {
    if (fileToDelete) {
      setSelectedFiles(prev => prev.filter(f => f !== fileToDelete))
      setFileToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports PDF, TXT, MD, and JSON files
        </p>
      </div>
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Files:</div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFile(file)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      )}

      <FilesAccordion vectorStoreId={vectorStoreId}/>

      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {fileToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
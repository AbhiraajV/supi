'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileIcon, Loader2 } from 'lucide-react'
import { uploadToVectorStore } from '@/app/actions/vector-store.action'

interface FileUploaderProps {
  vectorStoreId: string
}

export function FileUploader({ vectorStoreId }: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    try {
      const batch = await uploadToVectorStore(selectedFiles, vectorStoreId)
      console.log(batch)
      setSelectedFiles([])
    } catch (error) {
      console.error('Error uploading files:', error)
    }
    setUploading(false)
  }

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
        className="mb-4"
      >
        Select Files
      </Button>
      <input
        id="file-upload"
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Selected Files:</h4>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center space-x-2">
                <FileIcon className="w-4 h-4" />
                <span>{file.name}</span>
                <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedFiles.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Files'
          )}
        </Button>
      )}
    </div>
  )
}


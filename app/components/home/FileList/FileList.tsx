import { FileIcon, FileText, File, FileJson, Delete } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { deleteFile } from '@/app/actions/vector-store.action';

interface FileListProps {
  files: { filename: string; bytes: number,id:string }[];
  setFiles: (value: {
    filename: string;
    bytes: number;
    id: string;
}[] | ((prev: {
    filename: string;
    bytes: number;
    id: string;
}[]) => {
    filename: string;
    bytes: number;
    id: string;
}[])) => void
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'txt':
      return <FileText className="w-4 h-4 text-blue-500" />
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-500" />
    case 'pdf':
      return <File className="w-4 h-4 text-red-500" />
    default:
      return <FileIcon className="w-4 h-4 text-gray-500" />
  }
}

export function FileList({ files,setFiles }: FileListProps) {
  const [fileToDelete,setFileToDelete] = useState<{ filename: string; bytes: number,id:string } | null >(null);
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No files available</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {files.map((file, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            "bg-gray-50 hover:bg-gray-100 transition-colors",
            "border border-gray-200"
          )}
        >
          <div className="flex items-center space-x-3">
            {getFileIcon(file.filename)}
            <div>
              <p className="text-sm font-medium text-gray-700">{file.filename}</p>
              <p className="text-xs text-gray-500">
                {(file.bytes / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Delete className='text-red-600 cursor-pointer' onClick={()=>setFileToDelete(file)}/>
        </div>
      ))}

      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {fileToDelete?.filename}? Your supi will lose context from this file!
              
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async ()=>{
                if(!fileToDelete) return; 
                deleteFile(fileToDelete.id)
                setFiles(prev=>prev.filter(f=>f.id !== fileToDelete.id))
            }} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { FileIcon, Loader2 } from 'lucide-react'
import { retrieveVSFiles } from '@/app/actions/vector-store.action'
import useLocalStorageState from '@/app/hooks/useLocalstorageState'

interface FilesAccordionProps {
  vectorStoreId: string;
  supiId:string;
}

export function FilesAccordion({ vectorStoreId,supiId }: FilesAccordionProps) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useLocalStorageState<{ filename: string; bytes: number }[]>(`supi-files-${supiId}`,[])

  const handleRetrieveFiles = async () => {
    setLoading(true)
    try {
      const retrievedFiles = await retrieveVSFiles(vectorStoreId)
      setFiles(retrievedFiles)
    } catch (error) {
      console.error('Error retrieving files:', error)
    }
    setLoading(false)
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="files">
        <AccordionTrigger>Show Files in Supi</AccordionTrigger>
        <AccordionContent>
          <Button onClick={handleRetrieveFiles} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrieving...
              </>
            ) : (
              'Retrieve Files'
            )}
          </Button>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <FileIcon className="w-4 h-4" />
                  <span>{file.filename}</span>
                  <span className="text-sm text-gray-500">({(file.bytes / 1024).toFixed(2)} KB)</span>
                </li>
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}


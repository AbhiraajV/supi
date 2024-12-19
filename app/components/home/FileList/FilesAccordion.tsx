'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FileIcon } from 'lucide-react'
import { retrieveVSFiles } from '@/app/actions/vector-store.action'
import useLocalStorageState from '@/app/hooks/useLocalstorageState'
import { RefreshButton } from './RefreshButton'
import { cn } from '@/lib/utils'
import { FileList } from './FileList'

interface FilesAccordionProps {
  vectorStoreId?: string | null | undefined
}

export function FilesAccordion({ vectorStoreId }: FilesAccordionProps) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useLocalStorageState<{ filename: string; bytes: number,id:string }[]>(
    `supi-files-${vectorStoreId}`,
    []
  )

  const handleRetrieveFiles = async () => {
    setLoading(true)
    if (!vectorStoreId) return

    try {
      const retrievedFiles = await retrieveVSFiles(vectorStoreId)
      setFiles(retrievedFiles)
    } catch (error) {
      console.error('Error retrieving files:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!vectorStoreId) return null

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="files" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center space-x-2">
            <FileIcon className="w-5 h-5 text-gray-500" />
            <span className={cn(
              "font-medium",
              files.length > 0 && "text-primary"
            )}>
              Files ({files.length})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 max-h-[25vh] overflow-y-auto">
          <div className="space-y-4">
            <RefreshButton
              onClick={handleRetrieveFiles}
              loading={loading}
              className="mb-4"
            />
            <FileList setFiles={setFiles} files={files} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
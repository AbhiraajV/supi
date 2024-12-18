'use client'

import { useState } from 'react'
import { Assistant } from 'openai/resources/beta/assistants.mjs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUploader } from './FileUploader'

interface SupiCardProps {
  supi: Partial<Assistant> & { _request_id?: string | null | undefined } & { supiId: number | undefined }
  onUpdate: (updatedSupi: Partial<Assistant>) => void
}

export function SupiCard({ supi, onUpdate }: SupiCardProps) {
  const [name, setName] = useState(supi.name || '')
  const [instructions, setInstructions] = useState(supi.instructions || '')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    onUpdate({ ...supi, name: e.target.value })
  }

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstructions(e.target.value)
    onUpdate({ ...supi, instructions: e.target.value })
  }
  return (
    <div className="border-r-4 border-b-4 border-blue-500 p-4 mb-4 rounded-lg shadow-md bg-white">
      <Input
        value={name}
        onChange={handleNameChange}
        className="text-xl font-bold mb-2"
        placeholder="Supi Name"
      />
      <Textarea
        value={instructions}
        onChange={handleInstructionsChange}
        className="text-sm mb-4"
        placeholder="Supi Instructions"
        rows={3}
      />
      {supi?.tool_resources?.file_search?.vector_store_ids &&
        supi.tool_resources.file_search.vector_store_ids.length > 0 && (
          <FileUploader vectorStoreId={supi.tool_resources.file_search.vector_store_ids[0]} />
        )}
    </div>
  )
}


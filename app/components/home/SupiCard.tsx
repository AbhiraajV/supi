import { useCallback, useState } from 'react'
import { Assistant } from 'openai/resources/beta/assistants.mjs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MoreVertical, Trash2, Share2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileUploader } from './FileUploader'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {debounce} from 'lodash'
import { ChatInterface } from './Chat/ChatInterface'
interface SupiCardProps {
  supi: Partial<Assistant> & { _request_id?: string | null | undefined } & { supiId: number | undefined }
  onUpdate: (updatedSupi: Partial<Assistant>) => void
  onDelete?: () => void
}

export function SupiCard({ supi, onUpdate, onDelete }: SupiCardProps) {
  const [name, setName] = useState(supi.name || '')
  const [instructions, setInstructions] = useState(supi.instructions || '')
  const [isFocused, setIsFocused] = useState({ name: false, instructions: false })

  const debouncedUpdate = useCallback(
    debounce((updatedData) => {
        console.log(updatedData)
      onUpdate(updatedData); // Update the database with the latest changes
    }, 1200),
    [] // Ensure this callback is stable
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    const updatedData = { ...supi, name: newName, instructions };
    debouncedUpdate(updatedData); // Debounce the combined update
  };

  // Handle instructions changes
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInstructions = e.target.value;
    setInstructions(newInstructions);

    const updatedData = { ...supi, name, instructions: newInstructions };
    debouncedUpdate(updatedData); // Debounce the combined update
  };
  return (
    <div className="bg-white border-t-2 border-l-2 border-r-8 border-b-8 border-orange-700  rounded-lg shadow-md overflow-hidden w-full transition-all hover:shadow-lg">
      <div className="p-4 relative border-b space-y-3">
        
          <DropdownMenu>
            <DropdownMenuTrigger className='absolute top-0 right-0' asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
       <div className="flex items-start justify-between relative gap-4">
        <div className="flex-1 text-2xl">
            <Input
            value={name}
            onChange={handleNameChange}
            onFocus={() => setIsFocused((prev) => ({ ...prev, name: true }))}
            onBlur={() => setIsFocused((prev) => ({ ...prev, name: false }))}
            className={cn(
                "!text-2xl rounded-sm font-extrabold p-2 bg-transparent border-0 border-b border-transparent h-auto transition-all duration-200",
                "hover:border-gray-200 focus:border-primary focus:ring-0",
                "placeholder:text-gray-400",
                isFocused.name && "border-primary"
            )}
            placeholder="Enter Supi name..."
            />
        </div>
        </div>


        <Textarea
          value={instructions}
          onChange={handleInstructionsChange}
          onFocus={() => setIsFocused(prev => ({ ...prev, instructions: true }))}
          onBlur={() => setIsFocused(prev => ({ ...prev, instructions: false }))}
          className={cn(
            "min-h-[80px] h-fit bg-gray-50 border rounded-md transition-all duration-200",
            "text-md font-semibold resize-none",
            "hover:border-gray-300",
            "focus:ring-1 focus:ring-primary focus:border-primary",
            isFocused.instructions && "border-primary ring-1 ring-primary"
          )}
          placeholder="Enter instructions on how your Supi should answer your questions..."
          rows={4}
        />
      </div>

      <Tabs defaultValue="files" className="w-full px-2">
        <TabsList className="w-full border-b rounded-none bg-gray-50">
          <TabsTrigger 
            value="files" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:border-2 data-[state=active]:border-black"
          >
            Files
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:border-2 data-[state=active]:border-black"
          >
            Chat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="p-4">
          {supi?.tool_resources?.file_search?.vector_store_ids &&
            supi.tool_resources.file_search.vector_store_ids.length > 0 && (
              <FileUploader vectorStoreId={supi.tool_resources.file_search.vector_store_ids[0]} />
            )}
        </TabsContent>
        <TabsContent value="chat" className="p-4">
          <ChatInterface supi={supi}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import { User } from "@prisma/client"
import { useEffect, useState } from "react"
import { setGetUser } from "./actions/clerk.action"
import { SignInButton } from "@clerk/nextjs"
import { getSupis } from "./actions/supi.action"
import { Assistant } from "openai/resources/beta/assistants.mjs"
import { createASupi } from "./actions/consolidation.action"
import useLocalStorageState from "./hooks/useLocalstorageState"
import { Button } from "@/components/ui/button"
import { SupiCard } from "./components/home/SupiCard"
import { Plus } from "lucide-react"
import { deleteAssistant, updateAssistant } from "./actions/assistant.action"

export default function Home() {
  const [user, setUser] = useState<User | 'anonymous' | undefined>()
  const [supis, setSupis] = useLocalStorageState<
    (Partial<Assistant> & { _request_id?: string | null | undefined } & { supiId: number | undefined })[]
  >('supis', [])

  useEffect(() => {
    if (user && user !== 'anonymous') return
    setGetUser().then(u => {
      if (u) setUser(u)
    })
  }, [])

  useEffect(() => {
    if (!user || user === 'anonymous' || supis.length > 0) return
    getSupis(user.id).then(s => setSupis(s))
  }, [user])
  
  if (!user) return 'loading'
  if (user === 'anonymous') return <SignInButton />
  
  const handleCreateSupi = () => {
    createASupi({ userId: user.id, instructions: '', name: "" }).then(s => {
      setSupis(prev => ([...prev, s]))
    })
  }

  const handleUpdateSupi = (updatedSupi: Partial<Assistant>) => {
    if(!updatedSupi.name || !updatedSupi.instructions || !updatedSupi.id) return;
    updateAssistant({name:updatedSupi.name,instructions:updatedSupi.instructions,assistantId:updatedSupi.id}).then(() => setSupis(prev => prev.map(s => s.id === updatedSupi.id ? { ...s, ...updatedSupi } : s)))
  }

  const handleDeleteSupi = (assistant:Assistant,supiId: number) => {
    deleteAssistant(assistant,supiId).then(()=>{

      setSupis(prev => prev.filter(s => s.id !== assistant.id))
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Supi Manager</h1>
        <Button onClick={handleCreateSupi} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Supi
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supis.map(s => (
          <SupiCard
            key={s.id}
            supi={s}
            // vsId={s.tool_resources?.file_search}
            onUpdate={handleUpdateSupi}
            onDelete={() => handleDeleteSupi(s as Assistant,s.supiId!)}
          />
        ))}
      </div>
    </div>
  )
}
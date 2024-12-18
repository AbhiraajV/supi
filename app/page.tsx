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
import { FilesAccordion } from "./components/home/FilesAccordion"

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
    if (!user || user === 'anonymous') return
    getSupis(user.id).then(s => setSupis(s))
  }, [user])
  
  if (!user) return 'loading'
  if (user === 'anonymous') return <SignInButton />
  
  const handleCreateSupi = () => {
    createASupi({ userId: user.id, instructions: '', name: "My first supi" }).then(s => {
      setSupis(prev => ([...prev, s]))
    })
  }

  const handleUpdateSupi = (updatedSupi: Partial<Assistant>) => {
    setSupis(prev => prev.map(s => s.id === updatedSupi.id ? { ...s, ...updatedSupi } : s))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Supi Manager</h1>
      <Button onClick={handleCreateSupi} className="mb-6">Create a Supi</Button>
      <div className="space-y-6">
        {supis.map(s => (
          <div key={s.id}>
            <SupiCard supi={s} onUpdate={handleUpdateSupi} />
            {s?.tool_resources?.file_search?.vector_store_ids &&
              s.tool_resources.file_search.vector_store_ids.length > 0 && (
                <FilesAccordion
                  vectorStoreId={s.tool_resources.file_search.vector_store_ids[0]}
                  supiId={s.id!}
                />
              )}
          </div>
        ))}
      </div>
    </div>
  )
}


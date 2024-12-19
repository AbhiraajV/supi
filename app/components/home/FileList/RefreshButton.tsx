import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  onClick: () => void
  loading: boolean
  className?: string
}

export function RefreshButton({ onClick, loading, className }: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className={cn("w-full sm:w-auto", className)}
    >
      <RefreshCw 
        className={cn(
          "w-4 h-4 mr-2",
          loading && "animate-spin"
        )} 
      />
      {loading ? 'Refreshing...' : 'Refresh Files'}
    </Button>
  )
}
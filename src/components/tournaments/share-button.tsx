'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  tournamentId: string
  tournamentName?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ShareButton({ 
  tournamentId, 
  tournamentName = 'Tournament',
  variant = 'outline',
  size = 'default',
  className = ''
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Determine if we're on admin or player page
    const isAdminPage = window.location.pathname.includes('/admin/tournaments/')
    const url = isAdminPage 
      ? `${window.location.origin}/admin/tournaments/${tournamentId}`
      : `${window.location.origin}/dashboard/tournaments/${tournamentId}`
    
    try {
      // Try using the Web Share API if available (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `Join ${tournamentName} on GOALDEN`,
          text: `Check out this tournament: ${tournamentName}`,
          url: url,
        })
        toast.success('Tournament shared!')
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Tournament link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          toast.success('Tournament link copied to clipboard!')
          setTimeout(() => setCopied(false), 2000)
        } catch (clipboardError) {
          toast.error('Failed to copy link. Please try again.')
        }
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </Button>
  )
}


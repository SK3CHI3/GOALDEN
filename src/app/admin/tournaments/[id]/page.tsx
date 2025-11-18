import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AdminTournamentDetailClient } from '@/components/admin/tournaments/admin-tournament-detail-client'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) {
    return {
      title: 'Tournament Not Found',
      description: 'The tournament you are looking for does not exist.'
    }
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://goalden.vercel.app'}/admin/tournaments/${id}`
  const posterUrl = tournament.poster_url || '/images/GOALDEN LOGO/GOALDEN_logo.png'
  const fullPosterUrl = posterUrl.startsWith('http') ? posterUrl : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://goalden.vercel.app'}${posterUrl}`

  return {
    title: `${tournament.name} - GOALDEN Tournament (Admin)`,
    description: tournament.description || `Manage ${tournament.name} on GOALDEN. Entry fee: KES ${tournament.entry_fee}. Prize pool: KES ${tournament.prize_pool || 0}`,
    openGraph: {
      title: `${tournament.name} - GOALDEN Tournament`,
      description: tournament.description || `Join ${tournament.name} on GOALDEN. Entry fee: KES ${tournament.entry_fee}. Prize pool: KES ${tournament.prize_pool || 0}`,
      url: url,
      siteName: 'GOALDEN',
      images: [
        {
          url: fullPosterUrl,
          width: 1200,
          height: 630,
          alt: tournament.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tournament.name} - GOALDEN Tournament`,
      description: tournament.description || `Join ${tournament.name} on GOALDEN`,
      images: [fullPosterUrl],
    },
  }
}

export default async function AdminTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  const { id: tournamentId } = await params

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()

  if (error || !tournament) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Tournament Details</h1>
      </div>
      <AdminTournamentDetailClient tournament={tournament} />
    </div>
  )
}


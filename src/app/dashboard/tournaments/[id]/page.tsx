import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TournamentHeader } from '@/components/tournaments/tournament-header'
import { RegisterButton } from '@/components/tournaments/register-button'
import { TournamentBracket } from '@/components/tournaments/tournament-bracket'
import { TournamentChat } from '@/components/tournaments/tournament-chat'
import { TournamentDetailClient } from '@/components/tournaments/tournament-detail-client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://goalden.vercel.app'}/dashboard/tournaments/${id}`
  const posterUrl = tournament.poster_url || '/images/GOALDEN LOGO/GOALDEN_logo.png'
  const fullPosterUrl = posterUrl.startsWith('http') ? posterUrl : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://goalden.vercel.app'}${posterUrl}`

  return {
    title: `${tournament.name} - GOALDEN Tournament`,
    description: tournament.description || `Join ${tournament.name} on GOALDEN. Entry fee: KES ${tournament.entry_fee}. Prize pool: KES ${tournament.prize_pool || 0}`,
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

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const supabase = await createClient()
  const { id } = await params

  // Fetch tournament data
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tournament) {
    redirect('/dashboard')
  }

  // Check if user is registered
  const { data: registration } = await supabase
    .from('registrations')
    .select('*')
    .eq('tournament_id', id)
    .eq('user_id', user.id)
    .single()

  // Fetch participants
  const { data: participants } = await supabase
    .from('registrations')
    .select('*, profiles(*)')
    .eq('tournament_id', id)
    .eq('status', 'confirmed')

  // Fetch matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*, player1:player1_id(full_name), player2:player2_id(full_name)')
    .eq('tournament_id', id)
    .order('round', { ascending: true })

  // Find user's active match
  const userMatch = matches?.find(
    m => 
      (m.player1_id === user.id || m.player2_id === user.id) && 
      m.status === 'ongoing'
  )

  // Find user's upcoming matches
  const upcomingMatches = matches?.filter(
    m => 
      (m.player1_id === user.id || m.player2_id === user.id) && 
      m.status === 'pending' &&
      m.player1_id &&
      m.player2_id
  ) || []

  const isRegistered = !!registration
  const participantCount = participants?.length || 0

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Dashboard</span>
      </Link>

      <TournamentHeader 
        tournament={tournament} 
        isRegistered={isRegistered}
        participantCount={participantCount}
      />

      {!isRegistered && tournament.status === 'registration' && (
        <div className="mt-6">
          <RegisterButton tournamentId={tournament.id} />
        </div>
      )}

      <TournamentDetailClient
        tournament={tournament}
        matches={matches || []}
        participants={participants || []}
        userMatch={userMatch}
        upcomingMatches={upcomingMatches}
        userId={user.id}
        isRegistered={isRegistered}
      />
    </div>
  )
}

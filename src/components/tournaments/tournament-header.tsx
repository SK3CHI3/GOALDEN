import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Calendar, DollarSign, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { Tables } from '@/lib/database.types'
import { ShareButton } from './share-button'

interface TournamentHeaderProps {
  tournament: Tables<'tournaments'>
  isRegistered: boolean
  participantCount: number
}

export function TournamentHeader({ tournament, isRegistered, participantCount }: TournamentHeaderProps) {
  const statusColors = {
    registration: 'bg-blue-500',
    ongoing: 'bg-[#00FF88]',
    paused: 'bg-yellow-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500',
  }

  const formatColors = {
    single_elimination: 'bg-[#FFB800]',
    double_elimination: 'bg-purple-500',
  }

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#FFB800]" />
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
            </div>
            <ShareButton 
              tournamentId={tournament.id} 
              tournamentName={tournament.name}
              variant="outline"
              size="sm"
            />
          </div>
          
          {tournament.description && (
            <p className="text-gray-600 text-lg">{tournament.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[tournament.status as keyof typeof statusColors]}>
              {tournament.status.replace('_', ' ')}
            </Badge>
            <Badge className={formatColors[tournament.format as keyof typeof formatColors]}>
              {tournament.format.replace('_', ' ')}
            </Badge>
            {tournament.mode === 'realtime' && (
              <Badge variant="outline" className="border-[#00FF88] text-[#00FF88]">
                <Zap className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            )}
            {isRegistered && (
              <Badge variant="outline" className="border-[#00FF88] text-[#00FF88]">
                Registered
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Participants</span>
          </div>
          <p className="text-2xl font-bold">
            {participantCount}
            <span className="text-gray-600 text-base">/{tournament.max_slots}</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>Entry Fee</span>
          </div>
          <p className="text-2xl font-bold text-[#00FF88]">
            KES {tournament.entry_fee}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Trophy className="w-4 h-4" />
            <span>Prize Pool</span>
          </div>
          <p className="text-2xl font-bold text-[#FFB800]">
            KES {tournament.prize_pool || 0}
          </p>
        </div>

        {tournament.start_date && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Start Date</span>
            </div>
            <p className="text-lg font-semibold">
              {format(new Date(tournament.start_date), 'MMM d, HH:mm')}
            </p>
          </div>
        )}
      </div>

      {tournament.status === 'registration' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Registration Open:</strong> Tournament will start when all slots are filled or at the scheduled time.
          </p>
        </div>
      )}

      {tournament.status === 'paused' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Tournament Paused:</strong> This tournament has been temporarily paused by an administrator.
          </p>
        </div>
      )}
    </div>
  )
}


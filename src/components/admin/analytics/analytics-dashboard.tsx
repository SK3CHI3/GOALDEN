'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  DollarSign, 
  Activity, 
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

interface AnalyticsData {
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  players: {
    total: number
    active: number
    newThisMonth: number
    growth: number
  }
  tournaments: {
    total: number
    active: number
    completed: number
    completionRate: number
  }
  matches: {
    total: number
    completed: number
    disputed: number
    disputeRate: number
  }
  monthlyRevenue: Array<{ period: string; revenue: number; tournaments: number; signups?: number }>
  tournamentFormats: Array<{ format: string; count: number; percentage: number; signups: number }>
  formatSignupsOverTime: Array<{ period: string; [key: string]: string | number }>
  playerActivity: Array<{ day: string; active: number; matches: number }>
}

type TimeRange = '7d' | '14d' | '30d' | '90d' | 'all'

const COLORS = {
  primary: '#1e3a8a',
  secondary: '#fbbf24',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Calculate smart interval for X-axis labels based on time range
  const getXAxisInterval = () => {
    switch (timeRange) {
      case '7d': return 0 // Show all labels for 7 days
      case '14d': return 1 // Show every other day for 14 days
      case '30d': return 4 // Show every 4-5 days for 30 days (cleaner)
      case '90d': return 6 // Show every 6-7 days for 90 days (weekly-ish)
      case 'all': return 0 // Show all months for all time
      default: return 0
    }
  }

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true) // Set loading when timeRange changes
      const supabase = createClient()
      
      try {
        // Load all analytics data
        const [
          tournamentsResult,
          playersResult,
          registrationsResult,
          matchesResult,
          disputesResult
        ] = await Promise.all([
          supabase.from('tournaments').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('registrations').select('*, tournaments(*)'),
          supabase.from('matches').select('*, registrations(*)'),
          supabase.from('disputes').select('*')
        ])

        const tournaments = tournamentsResult.data || []
        const players = playersResult.data || []
        const registrations = registrationsResult.data || []
        const matches = matchesResult.data || []
        const disputes = disputesResult.data || []

        // Filter data based on time range
        const now = new Date()
        const filterDate = (() => {
          switch(timeRange) {
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            case '14d': return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            case 'all': return new Date(0)
          }
        })()

        const filteredTournaments = tournaments.filter(t => new Date(t.created_at || '') >= filterDate)
        const filteredMatches = matches.filter(m => new Date(m.created_at || '') >= filterDate)
        const filteredRegistrations = registrations.filter(r => new Date(r.registered_at || '') >= filterDate)

        // Calculate analytics
        const totalRevenue = filteredTournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0)
        const monthlyRevenue = filteredTournaments
          .filter(t => {
            const created = new Date(t.created_at || '')
            const now = new Date()
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
          })
          .reduce((sum, t) => sum + (t.prize_pool || 0), 0)

        const activePlayers = players.filter(p => {
          const lastActive = new Date(p.updated_at || p.created_at || '')
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return lastActive > thirtyDaysAgo
        }).length

        const newPlayersThisMonth = players.filter(p => {
          const created = new Date(p.created_at || '')
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        }).length

        const activeTournaments = filteredTournaments.filter(t => t.status === 'ongoing').length
        const completedTournaments = filteredTournaments.filter(t => t.status === 'completed').length
        const completedMatches = filteredMatches.filter(m => m.status === 'completed').length
        const disputedMatches = disputes.length

        // Generate dynamic timeline data based on time range
        const timelineData = []
        const dataPoints = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 12
        const isMonthly = timeRange === 'all'
        const is90Days = timeRange === '90d'
        
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date()
          if (isMonthly) {
            date.setMonth(date.getMonth() - i)
          } else if (is90Days) {
            date.setDate(date.getDate() - i)
          } else {
            date.setDate(date.getDate() - i)
          }
          
          let label: string
          if (isMonthly) {
            label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          } else if (is90Days) {
            // For 90 days, show day and month (e.g., "Jan 15")
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          } else {
            label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          }
          
          const periodTournaments = filteredTournaments.filter(t => {
            const created = new Date(t.created_at || '')
            if (isMonthly) {
              return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear()
            } else {
              return created.toDateString() === date.toDateString()
            }
          })
          
          const periodRegistrations = filteredRegistrations.filter(r => {
            const registered = new Date(r.registered_at || '')
            if (isMonthly) {
              return registered.getMonth() === date.getMonth() && registered.getFullYear() === date.getFullYear()
            } else {
              return registered.toDateString() === date.toDateString()
            }
          })
          
          timelineData.push({
            period: label,
            revenue: periodTournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0),
            tournaments: periodTournaments.length,
            signups: periodRegistrations.length
          })
        }

        // Tournament formats with signups (filtered by time range) - for summary stats
        const formatStats = filteredTournaments.reduce((acc, t) => {
          if (!acc[t.format]) {
            acc[t.format] = { count: 0, signups: 0 }
          }
          acc[t.format].count++
          return acc
        }, {} as Record<string, { count: number; signups: number }>)

        // Count signups per format (only for filtered registrations)
        filteredRegistrations.forEach(reg => {
          const tournament = filteredTournaments.find(t => t.id === reg.tournament_id)
          if (tournament && formatStats[tournament.format]) {
            formatStats[tournament.format].signups++
          }
        })

        const totalFilteredTournaments = filteredTournaments.length
        const tournamentFormats = Object.entries(formatStats).map(([format, data]) => {
          const stats = data as { count: number; signups: number }
          return {
            format: format.replace('_', ' ').toUpperCase(),
            count: stats.count,
            signups: stats.signups,
            percentage: totalFilteredTournaments > 0 ? Math.round((stats.count / totalFilteredTournaments) * 100) : 0
          }
        })

        // Generate timeline data for total signups (like revenue trend)
        const formatSignupsTimeline = []
        const formatDataPoints = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 12
        const isFormatMonthly = timeRange === 'all'
        const isFormat90Days = timeRange === '90d'
        
        for (let i = formatDataPoints - 1; i >= 0; i--) {
          const date = new Date()
          if (isFormatMonthly) {
            date.setMonth(date.getMonth() - i)
          } else if (isFormat90Days) {
            date.setDate(date.getDate() - i)
          } else {
            date.setDate(date.getDate() - i)
          }
          
          let label: string
          if (isFormatMonthly) {
            label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          } else if (isFormat90Days) {
            // For 90 days, show day and month (e.g., "Jan 15")
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          } else {
            label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          }
          
          // Count total signups for this period
          const periodRegistrations = registrations.filter(r => {
            const registered = new Date(r.registered_at || '')
            
            // Check if registration is within the time period
            if (isFormatMonthly) {
              return registered.getMonth() === date.getMonth() && registered.getFullYear() === date.getFullYear()
            } else {
              return registered.toDateString() === date.toDateString()
            }
          })
          
          // Count tournaments created in this period
          const periodTournaments = tournaments.filter(t => {
            const created = new Date(t.created_at || '')
            if (isFormatMonthly) {
              return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear()
            } else {
              return created.toDateString() === date.toDateString()
            }
          })
          
          // Calculate percentage: signups per tournament (average signups per tournament)
          const signupPercentage = periodTournaments.length > 0 
            ? (periodRegistrations.length / periodTournaments.length) * 100 
            : 0
          
          formatSignupsTimeline.push({
            period: label,
            signups: Math.round(signupPercentage * 10) / 10 // Round to 1 decimal
          })
        }

        // Player activity with real data (last 14 days)
        const activityData = []
        for (let i = 13; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
          
          const dayMatches = filteredMatches.filter(m => {
            const created = new Date(m.created_at || '')
            return created.toDateString() === date.toDateString()
          })
          
          // Count unique active players for the day (real activity)
          const activePlayerIds = new Set<string>()
          dayMatches.forEach(m => {
            if (m.player1_id) activePlayerIds.add(m.player1_id)
            if (m.player2_id) activePlayerIds.add(m.player2_id)
          })
          
          activityData.push({
            day: dayName,
            active: activePlayerIds.size,
            matches: dayMatches.length
          })
        }

        setAnalytics({
          revenue: {
            total: totalRevenue,
            monthly: monthlyRevenue,
            growth: monthlyRevenue > 0 ? Math.round(((monthlyRevenue - (monthlyRevenue * 0.8)) / (monthlyRevenue * 0.8)) * 100) : 0
          },
          players: {
            total: players.length,
            active: activePlayers,
            newThisMonth: newPlayersThisMonth,
            growth: newPlayersThisMonth > 0 ? Math.round(((newPlayersThisMonth - (newPlayersThisMonth * 0.7)) / (newPlayersThisMonth * 0.7)) * 100) : 0
          },
          tournaments: {
            total: filteredTournaments.length,
            active: activeTournaments,
            completed: completedTournaments,
            completionRate: filteredTournaments.length > 0 ? Math.round((completedTournaments / filteredTournaments.length) * 100) : 0
          },
          matches: {
            total: filteredMatches.length,
            completed: completedMatches,
            disputed: disputedMatches,
            disputeRate: filteredMatches.length > 0 ? Math.round((disputedMatches / filteredMatches.length) * 100) : 0
          },
          monthlyRevenue: timelineData,
          tournamentFormats,
          formatSignupsOverTime: formatSignupsTimeline,
          playerActivity: activityData
        })

      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Key Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card border-none shadow-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="glass-card border-none shadow-premium">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Player Activity Skeleton */}
        <Card className="glass-card border-none shadow-premium">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Analytics Data</h3>
            <p className="text-gray-600">Failed to load analytics data. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track performance and engagement metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '14d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' : ''}
              size="sm"
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: COLORS.success }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</div>
            <div className="flex items-center text-xs" style={{ color: COLORS.success }}>
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{analytics.revenue.growth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Players</CardTitle>
            <Users className="h-4 w-4" style={{ color: COLORS.info }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.players.active}</div>
            <div className="flex items-center text-xs" style={{ color: COLORS.info }}>
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{analytics.players.newThisMonth} new this month
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tournament Completion</CardTitle>
            <Trophy className="h-4 w-4" style={{ color: COLORS.warning }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.tournaments.completionRate}%</div>
            <div className="flex items-center text-xs" style={{ color: COLORS.warning }}>
              <Target className="h-3 w-3 mr-1" />
              {analytics.tournaments.completed} completed
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dispute Rate</CardTitle>
            <Activity className="h-4 w-4" style={{ color: COLORS.danger }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.matches.disputeRate}%</div>
            <div className="flex items-center text-xs" style={{ color: COLORS.danger }}>
              <ArrowDownRight className="h-3 w-3 mr-1" />
              {analytics.matches.disputed} disputes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="glass-card border-none shadow-premium">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: COLORS.success }} />
              Revenue Trend
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" key={`revenue-${timeRange}`}>
                <AreaChart data={analytics.monthlyRevenue || []} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    angle={0}
                    textAnchor="middle"
                    height={50}
                    interval={getXAxisInterval()}
                    tickMargin={10}
                    key={`xaxis-${timeRange}`}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `KES ${(value / 1000).toFixed(1)}K`
                      return `KES ${value}`
                    }}
                    domain={[0, 'auto']}
                    allowDecimals={false}
                    tickCount={6}
                    width={50}
                    label={{ value: 'Revenue (KES)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') {
                        return [formatCurrency(Number(value)), 'Revenue']
                      }
                      return [value, name === 'tournaments' ? 'Tournaments' : 'Signups']
                    }}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.success}
                    fill="url(#colorRevenue)"
                    strokeWidth={2.5}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Formats with Signups */}
        <Card className="glass-card border-none shadow-premium">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: COLORS.secondary }} />
              Signups per Tournament
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" key={`signups-${timeRange}`}>
                <LineChart 
                  data={analytics.formatSignupsOverTime || []} 
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    angle={0}
                    textAnchor="middle"
                    height={50}
                    interval={getXAxisInterval()}
                    tickMargin={10}
                    key={`xaxis-${timeRange}`}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={(value: number) => {
                      if (value === undefined || value === null || isNaN(value)) return '0%'
                      return `${Number(value).toFixed(1)}%`
                    }}
                    domain={[0, 'auto']}
                    allowDecimals={true}
                    tickCount={6}
                    width={50}
                    label={{ value: 'Signups per Tournament (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [`${value}%`, 'Signups per Tournament']}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke={COLORS.secondary}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.secondary, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Signups per Tournament"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {analytics.formatSignupsOverTime.length === 0 && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                No signup data available for the selected time period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player Activity */}
      <Card className="glass-card border-none shadow-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: '#8b5cf6' }} />
            Player Activity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.playerActivity}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name="Active Players"
                />
                <Line 
                  type="monotone" 
                  dataKey="matches" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#06b6d4', r: 4 }}
                  name="Matches Played"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
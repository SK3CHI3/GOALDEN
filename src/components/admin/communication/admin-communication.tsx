'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail, 
  Send, 
  Bell, 
  MessageSquare, 
  Phone,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { 
  getAnnouncements, 
  createAnnouncement, 
  getAdminMessages, 
  getAdminMessage,
  updateMessageStatus,
  replyToMessage,
  getCommunicationStats 
} from '@/app/actions/communication'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'tournament' | 'maintenance' | 'urgent'
  target: 'all' | 'active' | 'tournament' | 'specific'
  created_at: string
  sent_at: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  recipients: number
  opened: number
  clicked: number
}

interface Message {
  id: string
  player_name: string
  player_email: string
  subject: string
  content: string
  status: 'unread' | 'read' | 'replied'
  created_at: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface CommunicationStats {
  totalAnnouncements: number
  totalMessages: number
  unreadMessages: number
  responseRate: number
  avgResponseTime: number
  engagementRate: number
}

export function AdminCommunication() {
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<CommunicationStats | null>(null)
  const [activeTab, setActiveTab] = useState('announcements')
  const [showCompose, setShowCompose] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState('')

  // Compose form state
  const [composeData, setComposeData] = useState({
    title: '',
    content: '',
    type: 'general',
    target: 'all',
    scheduledAt: ''
  })

  useEffect(() => {
    async function loadCommunicationData() {
      try {
        // Load announcements
        const announcementsResult = await getAnnouncements()
        if (announcementsResult.data) {
          setAnnouncements(announcementsResult.data as Announcement[])
        }

        // Load messages
        const messagesResult = await getAdminMessages()
        if (messagesResult.data) {
          setMessages(messagesResult.data as Message[])
        }

        // Load stats
        const statsResult = await getCommunicationStats()
        if (statsResult.data) {
          setStats(statsResult.data)
        }

      } catch (error) {
        console.error('Error loading communication data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCommunicationData()
  }, [])

  const handleSendAnnouncement = async () => {
    try {
      const result = await createAnnouncement({
        title: composeData.title,
        content: composeData.content,
        type: composeData.type as 'general' | 'tournament' | 'maintenance' | 'urgent',
        target: composeData.target as 'all' | 'active' | 'tournament' | 'specific',
        scheduled_at: composeData.scheduledAt || undefined
      })

      if (result.error) {
        console.error('Error creating announcement:', result.error)
        alert('Failed to create announcement: ' + result.error)
        return
      }

      // Reload announcements
      const announcementsResult = await getAnnouncements()
      if (announcementsResult.data) {
        setAnnouncements(announcementsResult.data as Announcement[])
      }

      // Reload stats
      const statsResult = await getCommunicationStats()
      if (statsResult.data) {
        setStats(statsResult.data)
      }

      setShowCompose(false)
      setComposeData({ title: '', content: '', type: 'general', target: 'all', scheduledAt: '' })
    } catch (error) {
      console.error('Error sending announcement:', error)
      alert('Failed to send announcement')
    }
  }


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800'
      case 'tournament': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'maintenance': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800'
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return CheckCircle
      case 'scheduled': return Clock
      case 'failed': return AlertCircle
      default: return Clock
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Tabs and Content Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List Skeleton */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-none shadow-premium">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail Skeleton */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-none shadow-premium">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalAnnouncements || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-red-600">{stats?.unreadMessages || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats?.responseRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.avgResponseTime || 0}h</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="glass-card border-none shadow-premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'announcements' ? 'default' : 'outline'}
                onClick={() => setActiveTab('announcements')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Announcements
              </Button>
              <Button
                variant={activeTab === 'messages' ? 'default' : 'outline'}
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
            <Button
              onClick={() => setShowCompose(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const StatusIcon = getStatusIcon(announcement.status)
                const openRate = Math.round((announcement.opened / announcement.recipients) * 100)
                const clickRate = Math.round((announcement.clicked / announcement.recipients) * 100)

                return (
                  <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                          <p className="text-sm text-gray-600">{announcement.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <Badge variant="outline">
                          {announcement.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-900">{announcement.recipients}</div>
                        <div className="text-gray-600">Recipients</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-blue-600">{openRate}%</div>
                        <div className="text-gray-600">Open Rate</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-green-600">{clickRate}%</div>
                        <div className="text-gray-600">Click Rate</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-900">
                          {format(new Date(announcement.sent_at), 'MMM d, HH:mm')}
                        </div>
                        <div className="text-gray-600">Sent</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                    message.status === 'unread' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={async () => {
                    // Mark as read when opening
                    if (message.status === 'unread') {
                      await updateMessageStatus(message.id, 'read')
                      // Update local state
                      setMessages(messages.map(m => 
                        m.id === message.id ? { ...m, status: 'read' } : m
                      ))
                    }
                    setSelectedMessage(message)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                        {message.player_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{message.player_name}</h3>
                        <p className="text-sm text-gray-600">{message.subject}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      {message.status === 'unread' && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    {format(new Date(message.created_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compose Modal */}
      {showCompose && (
        <Card className="glass-card border-none shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Compose Announcement</span>
              <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={composeData.title}
                  onChange={(e) => setComposeData({ ...composeData, title: e.target.value })}
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={composeData.type}
                  onChange={(e) => setComposeData({ ...composeData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="general">General</option>
                  <option value="tournament">Tournament</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Content</label>
              <Textarea
                value={composeData.content}
                onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                placeholder="Write your announcement..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Target Audience</label>
                <select
                  value={composeData.target}
                  onChange={(e) => setComposeData({ ...composeData, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Players</option>
                  <option value="active">Active Players</option>
                  <option value="tournament">Tournament Participants</option>
                  <option value="specific">Specific Players</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Schedule (Optional)</label>
                <Input
                  type="datetime-local"
                  value={composeData.scheduledAt}
                  onChange={(e) => setComposeData({ ...composeData, scheduledAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSendAnnouncement}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Card className="glass-card border-none shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Message from {selectedMessage.player_name}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">{selectedMessage.subject}</h4>
              <p className="text-gray-700">{selectedMessage.content}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Reply</label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={async () => {
                  if (!replyText.trim()) {
                    alert('Please enter a reply message')
                    return
                  }
                  try {
                    const result = await replyToMessage(selectedMessage.id, replyText)
                    if (result.error) {
                      alert('Failed to send reply: ' + result.error)
                      return
                    }
                    // Update message status
                    setMessages(messages.map(m => 
                      m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
                    ))
                    setSelectedMessage({ ...selectedMessage, status: 'replied' })
                    setReplyText('')
                    alert('Reply sent successfully!')
                  } catch (error) {
                    console.error('Error sending reply:', error)
                    alert('Failed to send reply')
                  }
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Player
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


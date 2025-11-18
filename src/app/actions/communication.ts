'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

// Announcements
export async function getAnnouncements() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createAnnouncement(data: {
  title: string
  content: string
  type: 'general' | 'tournament' | 'maintenance' | 'urgent'
  target: 'all' | 'active' | 'tournament' | 'specific'
  scheduled_at?: string
}) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const status = data.scheduled_at ? 'scheduled' : 'draft'
  const sent_at = data.scheduled_at ? null : new Date().toISOString()

  // Get recipient count based on target
  let recipients = 0
  if (data.target === 'all') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    recipients = count || 0
  } else if (data.target === 'active') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString())
    recipients = count || 0
  } else if (data.target === 'tournament') {
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'registered')
    recipients = count || 0
  }

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      title: data.title,
      content: data.content,
      type: data.type,
      target: data.target,
      status,
      sent_at,
      scheduled_at: data.scheduled_at || null,
      recipients,
      opened: 0,
      clicked: 0,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { data: announcement, error: null }
}

export async function updateAnnouncementStats(announcementId: string, stats: {
  opened?: number
  clicked?: number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .update(stats)
    .eq('id', announcementId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Admin Messages (Support Messages)
export async function getAdminMessages() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('admin_messages')
    .select(`
      *,
      profiles!admin_messages_user_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  // Transform data to match Message interface
  const messages = data?.map(msg => ({
    id: msg.id,
    player_name: msg.profiles?.full_name || 'Unknown',
    player_email: msg.profiles?.email || '',
    subject: msg.subject,
    content: msg.content,
    status: msg.status,
    created_at: msg.created_at,
    priority: msg.priority,
    user_id: msg.user_id
  })) || []

  return { data: messages, error: null }
}

export async function getAdminMessage(messageId: string) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('admin_messages')
    .select(`
      *,
      profiles!admin_messages_user_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('id', messageId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  const message = {
    id: data.id,
    player_name: data.profiles?.full_name || 'Unknown',
    player_email: data.profiles?.email || '',
    subject: data.subject,
    content: data.content,
    status: data.status,
    created_at: data.created_at,
    priority: data.priority,
    user_id: data.user_id
  }

  return { data: message, error: null }
}

export async function updateMessageStatus(messageId: string, status: 'unread' | 'read' | 'replied') {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('admin_messages')
    .update({ status })
    .eq('id', messageId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { error: null }
}

export async function replyToMessage(messageId: string, reply: string) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  // Get the original message
  const { data: originalMessage, error: fetchError } = await supabase
    .from('admin_messages')
    .select('user_id, subject')
    .eq('id', messageId)
    .single()

  if (fetchError || !originalMessage) {
    return { error: 'Message not found' }
  }

  // Update message status to replied
  await supabase
    .from('admin_messages')
    .update({ status: 'replied' })
    .eq('id', messageId)

  // Create a notification or send email (you can implement this later)
  // For now, we'll just mark it as replied

  revalidatePath('/admin/dashboard')
  return { error: null }
}

export async function getCommunicationStats() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  // Get announcements count
  const { count: totalAnnouncements } = await supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })

  // Get messages count
  const { count: totalMessages } = await supabase
    .from('admin_messages')
    .select('*', { count: 'exact', head: true })

  // Get unread messages
  const { count: unreadMessages } = await supabase
    .from('admin_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unread')

  // Get replied messages for response rate
  const { count: repliedMessages } = await supabase
    .from('admin_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'replied')

  const responseRate = totalMessages && totalMessages > 0
    ? Math.round((repliedMessages || 0) / totalMessages * 100)
    : 0

  // Calculate average response time (in hours)
  const { data: repliedMessagesData } = await supabase
    .from('admin_messages')
    .select('created_at, updated_at')
    .eq('status', 'replied')

  let avgResponseTime = 0
  if (repliedMessagesData && repliedMessagesData.length > 0) {
    const totalTime = repliedMessagesData.reduce((sum, msg) => {
      const created = new Date(msg.created_at)
      const updated = new Date(msg.updated_at || msg.created_at)
      const diffHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60)
      return sum + diffHours
    }, 0)
    avgResponseTime = Math.round((totalTime / repliedMessagesData.length) * 10) / 10
  }

  // Calculate engagement rate from announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('recipients, opened')
    .eq('status', 'sent')

  let engagementRate = 0
  if (announcements && announcements.length > 0) {
    const totalRecipients = announcements.reduce((sum, a) => sum + (a.recipients || 0), 0)
    const totalOpened = announcements.reduce((sum, a) => sum + (a.opened || 0), 0)
    engagementRate = totalRecipients > 0
      ? Math.round((totalOpened / totalRecipients) * 100)
      : 0
  }

  return {
    data: {
      totalAnnouncements: totalAnnouncements || 0,
      totalMessages: totalMessages || 0,
      unreadMessages: unreadMessages || 0,
      responseRate,
      avgResponseTime,
      engagementRate
    },
    error: null
  }
}

// User function to send message to admin
export async function sendMessageToAdmin(data: {
  subject: string
  content: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: message, error } = await supabase
    .from('admin_messages')
    .insert({
      user_id: user.id,
      subject: data.subject,
      content: data.content,
      priority: data.priority || 'medium',
      status: 'unread'
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: message, error: null }
}


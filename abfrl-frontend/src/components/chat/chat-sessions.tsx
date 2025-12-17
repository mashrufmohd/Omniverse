'use client'

import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'

interface ChatSession {
  session_id: string
  created_at: string
  message_count: number
  title: string
}

interface ChatSessionsProps {
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
}

export function ChatSessions({ currentSessionId, onSessionSelect, onNewChat }: ChatSessionsProps) {
  const { user } = useAuthContext()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      fetchSessions()
    }
  }, [user?.uid])

  const fetchSessions = async () => {
    if (!user?.uid) return
    
    try {
      const response = await api.get(`/api/v1/chat/sessions/${user.uid}`)
      if (response.data.success) {
        setSessions(response.data.sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    if (!user?.uid) return
    
    try {
      const response = await api.post('/api/v1/chat/sessions', {
        user_id: user.uid
      })
      
      if (response.data.success) {
        await fetchSessions()
        onNewChat()
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this chat?')) return
    
    try {
      await api.delete(`/api/v1/chat/history/${sessionId}`)
      await fetchSessions()
      if (currentSessionId === sessionId) {
        onNewChat()
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  return (
    <div className="h-full border-r-4 border-border bg-muted/30 flex flex-col">
      <div className="p-4 border-b-2 border-border">
        <Button
          onClick={handleNewChat}
          className="w-full font-mono"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          NEW CHAT
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No chats yet
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => onSessionSelect(session.session_id)}
              className={`w-full text-left p-3 rounded border-2 transition-all group hover:border-primary ${
                currentSessionId === session.session_id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium truncate font-mono">
                      {session.title}
                    </p>
                  </div>
                  <p className="text-xs opacity-70">
                    {new Date(session.created_at).toLocaleDateString()} • {session.message_count} messages
                  </p>
                </div>
                <button
                  onClick={(e) => deleteSession(session.session_id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

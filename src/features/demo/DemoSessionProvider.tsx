import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DemoContext } from './demoContext'
import { mockPosts } from '../feed/data/mockFeed'
import { mockOwnProfile } from '../profile/data/mockProfiles'
import { mockConversations } from './mockConversations'
import type { DemoConversation } from './demoContext'
import type { DemoPostDraft, FeedPost } from '../feed/types/feed.types'
import type { ProfileDetails } from '../profile/types/profile.types'

const toggle = (ids: string[], id: string) => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]

// Shared only by the public demo routes. This is not an authenticated session.
export function DemoSessionProvider() {
  const [viewer, setViewer] = useState(mockOwnProfile)
  const [rawPosts, setPosts] = useState(mockPosts)
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [connectionIds, setConnectionIds] = useState<string[]>([])
  const [conversations, setConversations] = useState<DemoConversation[]>(mockConversations)
  const photoUrl = useRef<string | undefined>(undefined)
  useEffect(() => () => { if (photoUrl.current) URL.revokeObjectURL(photoUrl.current) }, [])

  function updateProfile(details: ProfileDetails, photo?: File) {
    if (photo) {
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current)
      photoUrl.current = URL.createObjectURL(photo)
    }
    setViewer(previous => ({ ...previous, ...details,
      name: `${details.firstName} ${details.lastName}`,
      initials: `${Array.from(details.firstName)[0] ?? ''}${Array.from(details.lastName)[0] ?? ''}`.toLocaleUpperCase('pt-BR'),
      photoUrl: photoUrl.current,
    }))
  }
  function publish(draft: DemoPostDraft) {
    if (!draft.text.trim() && !draft.attachments.length) return
    const post: FeedPost = { id: `demo-local-${crypto.randomUUID()}`, author: viewer,
      timeLabel: 'Nesta sessão', topic: 'Sua publicação · Demo', text: draft.text,
      attachments: draft.attachments, localDemo: true, likes: 0, comments: [] }
    setPosts(previous => [post, ...previous])
  }
  function sendMessage(conversationId: string, text: string) {
    const content = text.trim()
    if (!content || content.length > 2000) return
    setConversations(previous => previous.map(conversation => conversation.id === conversationId
      ? { ...conversation, messages: [...conversation.messages, { id: crypto.randomUUID(), senderId: viewer.id, text: content, time: 'Agora' }] }
      : conversation))
  }
  const posts = rawPosts.map(post => post.author.id === viewer.id ? { ...post, author: viewer } : post)
  return <DemoContext.Provider value={{ viewer, posts, likedIds, savedIds, connectionIds, conversations, sendMessage,
    toggleLike: id => setLikedIds(previous => toggle(previous, id)),
    toggleSave: id => setSavedIds(previous => toggle(previous, id)),
    toggleConnection: id => setConnectionIds(previous => toggle(previous, id)),
    publish, updateProfile,
  }}><Outlet /></DemoContext.Provider>
}

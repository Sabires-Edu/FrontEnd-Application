import { createContext, useContext } from 'react'
import type { DemoPostDraft, FeedPost } from '../feed/types/feed.types'
import type { OwnProfile, ProfileDetails } from '../profile/types/profile.types'

export interface DemoMessage {
  id: string
  senderId: string
  text: string
  time: string
}
export interface DemoConversation {
  id: string
  kind: 'direct' | 'group'
  title: string
  subtitle: string
  participantIds: string[]
  messages: DemoMessage[]
}

export interface DemoSession {
  viewer: OwnProfile
  posts: FeedPost[]
  likedIds: string[]
  savedIds: string[]
  connectionIds: string[]
  conversations: DemoConversation[]
  sendMessage: (conversationId: string, text: string) => void
  toggleLike: (id: string) => void
  toggleSave: (id: string) => void
  toggleConnection: (id: string) => void
  publish: (draft: DemoPostDraft) => void
  updateProfile: (details: ProfileDetails, photo?: File) => void
}
export const DemoContext = createContext<DemoSession | null>(null)
export function useDemoSession() {
  const session = useContext(DemoContext)
  if (!session) throw new Error('DemoSessionProvider is required')
  return session
}

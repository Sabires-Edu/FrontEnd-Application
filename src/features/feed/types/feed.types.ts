// Internal presentation models. These are not backend DTOs.
export interface Student {
  id: string
  name: string
  initials: string
  photoUrl?: string
  course: string
  institution: string
  tone: 'teal' | 'lavender' | 'peach' | 'blue'
}

export interface SuggestedStudent extends Student {
  interest: string
  bio: string
}

export interface FeedComment {
  id: string
  author: Student
  text: string
  replies?: FeedComment[]
}

// Demo attachments expose metadata only: no upload, preview URL or download.
export interface DemoAttachment {
  name: string
  size: number
}

export interface DemoPostDraft {
  text: string
  attachments: DemoAttachment[]
}

export interface FeedPost {
  id: string
  author: Student
  timeLabel: string
  topic: string
  text: string
  likes: number
  comments: FeedComment[]
  featured?: boolean
  localDemo?: boolean
  attachments?: DemoAttachment[]
  resource?: { title: string; description: string; label: string }
}

export type FeedViewState = 'ready' | 'loading' | 'error'

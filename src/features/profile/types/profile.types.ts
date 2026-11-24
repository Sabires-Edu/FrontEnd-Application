
import type { Student } from '../../feed/types/feed.types'

// Presentation-only models; not API response or PATCH contracts.
export interface Profile extends Student {
  biography: string
  interests: string[]
}

export interface ProfileDetails {
  firstName: string
  lastName: string
  email: string
  formation: string
  birthDate: string
  biography: string
}


export interface OwnProfile extends Profile, ProfileDetails {}

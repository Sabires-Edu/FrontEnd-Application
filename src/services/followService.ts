
import { apiRequest } from './api/apiClient'

export function followUser(userId: string) {
  return apiRequest<unknown>(`/v1/users/me/follows/${userId}`, {
    method: 'POST',
  })
}

export interface FollowUser {
  userid: string
  firstname: string
  lastname: string
  email: string
  profilepicture: string | null
  biography: string | null
  statusid: number
  followers: number
  following: number
}

export interface FollowListResponse {
  success: boolean
  title: string
  status: number
  response: {
    users: FollowUser[]
    pagination: {
      page: number
      limit: number
      total_Elements: number
      total_Pages: number
    }
  }
}

export function getFollowers(userId: string) {
  return apiRequest<FollowListResponse>(
    `/v1/users/${userId}/followers`,
    {
      method: 'GET',
    }
  )
}

/* Quem o estudante está seguindo */

export function getFollowings(userId: string) {
  return apiRequest<FollowListResponse>(
    `/v1/users/${userId}/followings`,
    {
      method: 'GET',
    }
  )
}

export function getPendingFollows() {
  return apiRequest<FollowListResponse>(
    '/v1/users/me/follows/pending',
    {
      method: 'GET',
    }
  )
}

export function updateFollowStatus(userId: string, status: number) {
  return apiRequest<unknown>(
    `/v1/users/me/follows/${userId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}

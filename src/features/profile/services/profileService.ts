
import { apiRequest } from '../../../services/api/apiClient'

// Estrutura dos dados do usuário retornados pelo Back-End.
export interface MyProfileResponse {
  status: number
  response: {
    me: {
      userId: string
      firstName: string
      lastName: string
      email: string
      profilePicture: string | null
      biography: string | null
      statusId: number
      createdAt: string
      updatedAt: string
      birthDate: string | null
      totalFollowers: number
      totalFollowing: number
    }
  }
}

// Dados opcionais para atualização do perfil.
export interface UpdateProfileRequest {
  firstname?: string
  lastname?: string
  statusid?: number
  biography?: string
  birthdate?: string
}

// Busca os dados do usuário autenticado.
export function getMyProfile() {
  return apiRequest<MyProfileResponse>('/v1/users/me', {
    method: 'GET',
  })
}

// Atualiza os dados do usuário autenticado.
export function updateMyProfile(data: UpdateProfileRequest) {
  return apiRequest<unknown>('/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}


export function updateProfilePicture(file: File) {
  const formData = new FormData()

  formData.append('file', file)

  return apiRequest<unknown>('/v1/users/me/picture', {
    method: 'PUT',
    body: formData,
  })
}


import { apiRequest } from '../../../services/api/apiClient'

// Dados que serão enviados para atualizar as informações do perfil.
export interface UpdateProfileRequest {
    firstname: string
    lastname: string
    statusid: number
    biography: string
    birthdate: string
}

// Busca os dados do usuário autenticado.
export function getMyProfile() {
    return apiRequest<unknown>('/v1/users/me', {
    method: 'GET',
    })
}

// Atualiza as informações do perfil.
export function updateMyProfile(data: UpdateProfileRequest) {
    return apiRequest<unknown>('/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

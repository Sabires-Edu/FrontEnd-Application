import { apiRequest } from '../../../services/api/apiClient'

import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from '../types/auth.types'

export function login(data: LoginRequest) {
  return apiRequest<LoginResponse>('/v1/users/me/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function register(data: RegisterRequest) {
  return apiRequest<unknown>('/v1/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
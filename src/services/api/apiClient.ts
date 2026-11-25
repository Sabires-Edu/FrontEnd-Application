
const API_URL = import.meta.env.VITE_API_URL

interface ApiErrorResponse {
  success?: boolean
  title?: string
  detail?: string
  status?: number
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('sabires_token')

  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type')

  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const errorData = data as ApiErrorResponse

    const errorMessage =
      (typeof errorData === 'object' && errorData !== null
        ? errorData.detail || errorData.title
        : typeof data === 'string' && data
          ? data
        : undefined) ||
          'Não foi possível conectar ao servidor. Tente novamente em instantes.'

    throw new ApiError(
      errorMessage,
      response.status,
      data,
    )
  }

  return data as T
}

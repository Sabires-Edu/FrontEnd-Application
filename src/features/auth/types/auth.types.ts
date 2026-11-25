export interface LoginRequest {
  Email: string
  Password: string
}

export interface RegisterRequest {
  FirstName: string
  LastName?: string
  Email: string
  Password: string
  BirthDate: string
  StatusId: number
  ProfilePicture?: string
  Biography?: string
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  birthDate: string
  statusId: number
  password: string
  confirmPassword: string
}

//Resposta da API de login
export interface LoginResponse {
  success: boolean
  title: string
  status: number
  response: {
    jwt: string
  }
}
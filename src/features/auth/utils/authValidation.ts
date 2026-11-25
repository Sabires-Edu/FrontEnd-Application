import type { LoginFormData } from '../types/auth.types'

export function validateLogin({ email, password }: LoginFormData) {
  const errors: { email?: string; password?: string } = {}
  if (!email.trim()) errors.email = 'Informe seu email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Informe um email válido.'
  // O backend ainda não documentou regras de tamanho para a senha de login.
  if (!password) errors.password = 'Informe sua senha.'
  return errors
}

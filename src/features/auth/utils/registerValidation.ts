import type { RegisterFormData, RegisterRequest } from '../types/auth.types'

export type RegistrationFields = Omit<RegisterFormData, 'statusId'>
export type RegistrationErrors = Partial<Record<keyof RegistrationFields, string>>

export function validateRegistration(form: RegistrationFields) {
  const errors: RegistrationErrors = {}
  if (!form.firstName.trim()) errors.firstName = 'Informe seu nome.'
  if (!form.email.trim()) errors.email = 'Informe seu email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Informe um email válido.'
  if (!form.password) errors.password = 'Informe sua senha.'
  if (!form.confirmPassword) errors.confirmPassword = 'Confirme sua senha.'
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'As senhas precisam ser iguais.'

  // BirthDate é obrigatório no RegisterRequest existente; não impõe idade mínima.
  if (!form.birthDate) errors.birthDate = 'Informe sua data de nascimento.'
  else {
    const date = new Date(`${form.birthDate}T00:00:00`)
    const [year, month, day] = form.birthDate.split('-').map(Number)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) || Number.isNaN(date.getTime())
      || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      errors.birthDate = 'Informe uma data válida.'
    } else if (date > new Date()) errors.birthDate = 'A data de nascimento não pode estar no futuro.'
  }
  return errors
}

export function parseRegistrationStatusId(value: string | undefined): number | undefined {
  if (!value?.trim() || !/^-?\d+$/.test(value.trim())) return undefined
  const statusId = Number(value)
  return Number.isSafeInteger(statusId) ? statusId : undefined
}

export function createRegisterRequest(form: RegistrationFields, statusId: number): RegisterRequest {
  return {
    FirstName: form.firstName.trim(),
    ...(form.lastName.trim() ? { LastName: form.lastName.trim() } : {}),
    Email: form.email.trim(),
    Password: form.password,
    BirthDate: form.birthDate,
    StatusId: statusId,
  }
}

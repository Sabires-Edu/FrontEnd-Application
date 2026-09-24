import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedInput } from '../../../components/ui/AnimatedInput'
import { BoxReveal } from '../../../components/ui/BoxReveal'
import { ApiError } from '../../../services/api/apiClient'
import { register } from '../services/authService'
import {
  createRegisterRequest,
  parseRegistrationStatusId,
  validateRegistration,
  type RegistrationErrors,
  type RegistrationFields,
} from '../utils/registerValidation'

const fields = [
  { name: 'firstName', label: 'Nome', type: 'text', autoComplete: 'given-name', placeholder: 'Seu nome' },
  { name: 'lastName', label: 'Sobrenome', type: 'text', autoComplete: 'family-name', placeholder: 'Seu sobrenome' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'voce@exemplo.com' },
  { name: 'birthDate', label: 'Data de nascimento', type: 'date', autoComplete: 'bday', placeholder: undefined },
  { name: 'password', label: 'Senha', type: 'password', autoComplete: 'new-password', placeholder: 'Crie sua senha' },
  { name: 'confirmPassword', label: 'Confirmar senha', type: 'password', autoComplete: 'new-password', placeholder: 'Repita sua senha' },
] as const

export function RegisterForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegistrationFields>({ firstName: '', lastName: '', email: '', birthDate: '', password: '', confirmPassword: '' })
  const [visible, setVisible] = useState({ password: false, confirmPassword: false })
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const submitting = useRef(false)
  const inputRefs = useRef<Partial<Record<keyof RegistrationFields, HTMLInputElement | null>>>({})
  // TODO: backend deve definir o StatusId inicial. Nunca assumir um valor padrão.
  const statusId = parseRegistrationStatusId(import.meta.env.VITE_REGISTRATION_STATUS_ID)

  function updateField(name: keyof RegistrationFields, value: string) {
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: undefined, ...(name === 'password' ? { confirmPassword: undefined } : {}) }))
    setApiError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const validation = validateRegistration(form)
    setErrors(validation)
    setApiError('')
    const firstInvalidField = fields.find(({ name }) => validation[name])
    if (firstInvalidField) {
      inputRefs.current[firstInvalidField.name]?.focus()
      return
    }
    if (statusId === undefined) {
      setApiError('O cadastro está temporariamente indisponível. Tente novamente mais tarde.')
      return
    }
    submitting.current = true
    setLoading(true)
    try {
      // Resposta permanece unknown; não cria sessão nem faz login automático.
      await register(createRegisterRequest(form, statusId))
      navigate('/login', { replace: true })
    } catch (error: unknown) {
      setApiError(error instanceof ApiError
        ? error.status === 429
          ? 'Muitas tentativas. Aguarde um pouco e tente novamente.'
          : error.message
        : 'Não foi possível conectar ao Sabires. Verifique sua conexão e tente novamente.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-sm">
      <BoxReveal className="mb-3"><p className="text-xs font-semibold tracking-[0.18em] text-teal-700">VEM FAZER PARTE</p></BoxReveal>
      <BoxReveal><h1 className="sabires-heading text-3xl font-semibold tracking-tight sm:text-4xl">Novas conexões<br />começam com você.</h1></BoxReveal>
      <BoxReveal className="mb-8 mt-4"><p className="text-sm leading-6 text-slate-600">Crie sua conta no Sabires e compartilhe o que você sabe. Sempre há algo novo para descobrir.</p></BoxReveal>
      <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
        {fields.map(({ name, label, type, autoComplete, placeholder }) => {
          const passwordField = name === 'password' || name === 'confirmPassword' ? name : undefined
          const isVisible = passwordField ? visible[passwordField] : false
          return (
            <BoxReveal key={name} className="mb-5">
              <label htmlFor={`register-${name}`} className="mb-2 block text-sm font-medium">
                {label}{name === 'lastName' && <span className="ml-1 font-normal text-slate-600">(opcional)</span>}
              </label>
              <div className="relative min-w-0">
                <AnimatedInput
                  ref={(element) => { inputRefs.current[name] = element }}
                  id={`register-${name}`}
                  name={name}
                  type={isVisible ? 'text' : type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  required={name !== 'lastName'}
                  disabled={loading}
                  value={form[name]}
                  onChange={(event) => updateField(name, event.target.value)}
                  className={`min-w-0 placeholder:text-slate-500 ${passwordField ? 'pr-12' : ''}`}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `register-${name}-error` : undefined}
                />
                {passwordField && (
                  <button type="button" onClick={() => setVisible((previous) => ({ ...previous, [passwordField]: !previous[passwordField] }))} aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} ${passwordField === 'confirmPassword' ? 'confirmação de senha' : 'senha'}`} aria-pressed={isVisible} className="absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-lg text-slate-500 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700">
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {errors[name] && <p id={`register-${name}-error`} role="alert" className="mt-2 text-xs text-red-700">{errors[name]}</p>}
            </BoxReveal>
          )
        })}
        {apiError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{apiError}</p>}
        <BoxReveal>
          <button disabled={loading} type="submit" className="group/btn relative flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#40E0D0] text-sm font-semibold text-[#1F2937] shadow-sm transition hover:bg-[#65e7da] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-65">
            {loading ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" />Criando conta...</> : <>Criar conta no Sabires<ArrowRight size={18} /></>}
            <span className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-teal-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px h-px bg-linear-to-r from-transparent via-[#84CC16] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
          </button>
        </BoxReveal>
        <BoxReveal className="mt-7 text-center"><p className="text-sm text-slate-600">Já possui uma conta? <Link to="/login" className="font-semibold text-teal-700 underline-offset-4 hover:underline">Entrar</Link></p></BoxReveal>
      </form>
    </div>
  )
}

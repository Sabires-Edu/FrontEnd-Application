import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedInput } from '../../../components/ui/AnimatedInput'
import { BoxReveal } from '../../../components/ui/BoxReveal'
import { ApiError } from '../../../services/api/apiClient'
import { login } from '../services/authService'
import type { LoginFormData } from '../types/auth.types'
import { validateLogin } from '../utils/authValidation'

export function LoginForm() {
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '', rememberMe: false })
  const [visible, setVisible] = useState(false)
  const [errors, setErrors] = useState<ReturnType<typeof validateLogin>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const submitting = useRef(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function updateField(field: 'email' | 'password', value: string) {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setApiError('')
    setSuccess(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const validation = validateLogin(form)
    setErrors(validation)
    setApiError('')
    setSuccess(false)
    if (Object.keys(validation).length) {
      if (validation.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }
    submitting.current = true
    setLoading(true)
    try {
      // Retorno unknown: não inferir sessão, tokens ou usuário da resposta.
      await login({ Email: form.email.trim(), Password: form.password })
      setSuccess(true)
      setForm((previous) => ({ ...previous, password: '' }))
    } catch (error: unknown) {
      setApiError(error instanceof ApiError
        ? error.status === 401 || error.status === 403
          ? 'Não foi possível acessar com essas credenciais. Confira seu email e senha.'
          : error.status === 429
            ? 'Muitas tentativas. Aguarde um pouco e tente novamente.'
            : error.message
        : 'Não foi possível conectar ao Sabires. Verifique sua conexão e tente novamente.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <BoxReveal className="mb-3"><p className="text-xs font-semibold tracking-[0.18em] text-teal-700">BOM TER VOCÊ POR AQUI</p></BoxReveal>
      <BoxReveal><h1 className="sabires-heading text-3xl font-semibold tracking-tight sm:text-4xl">Seu próximo saber<br />começa aqui.</h1></BoxReveal>
      <BoxReveal className="mb-8 mt-4"><p className="text-sm leading-6 text-slate-600">Entre no Sabires e continue conectando ideias, pessoas e possibilidades.</p></BoxReveal>

      <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <BoxReveal className="mb-5">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
          <AnimatedInput ref={emailRef} id="email" name="email" type="email" autoComplete="username" placeholder="voce@exemplo.com" className="placeholder:text-slate-500" required disabled={loading} value={form.email} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
          {errors.email && <p id="email-error" role="alert" className="mt-2 text-xs text-red-700">{errors.email}</p>}
        </BoxReveal>
        <BoxReveal className="mb-5">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label>
          <div className="relative">
            <AnimatedInput ref={passwordRef} id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" required disabled={loading} value={form.password} onChange={(event) => updateField('password', event.target.value)} className="pr-12 placeholder:text-slate-500" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
            <button type="button" onClick={() => setVisible((previous) => !previous)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible} className="absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-lg text-slate-500 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700">
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p id="password-error" role="alert" className="mt-2 text-xs text-red-700">{errors.password}</p>}
        </BoxReveal>
        <BoxReveal className="mb-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-600 sm:text-sm">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} disabled={loading} onChange={(event) => setForm((previous) => ({ ...previous, rememberMe: event.target.checked }))} className="size-4 shrink-0 accent-teal-700" />
            Manter conectado neste dispositivo
          </label>
        </BoxReveal>
        {apiError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{apiError}</p>}
        {success && <p role="status" className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">.Login realizado com sucesso..</p>}
        <BoxReveal>
          <button disabled={loading} type="submit" className="group/btn relative flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#40E0D0] text-sm font-semibold text-[#1F2937] shadow-sm transition hover:bg-[#65e7da] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-65">
            {loading ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" />Acessando...</> : <>Acessar Sabires<ArrowRight size={18} /></>}
            <span className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-teal-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px h-px bg-linear-to-r from-transparent via-[#84CC16] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
          </button>
        </BoxReveal>
        <BoxReveal className="mt-7 text-center"><p className="text-sm text-slate-600">Ainda não faz parte? <Link to="/cadastro" className="font-semibold text-teal-700 underline-offset-4 hover:underline">Cadastre-se</Link></p></BoxReveal>
      </form>
    </div>
  )
}

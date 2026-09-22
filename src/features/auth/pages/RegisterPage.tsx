import { Link } from 'react-router-dom'
import '../auth.css'

export function RegisterPage() {
  return (
    <main className="sabires-auth flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="sabires-heading text-3xl font-semibold">Faça parte do Sabires</h1>
        <p className="my-6 leading-7 text-slate-600">Estamos preparando o cadastro. Em breve, você poderá criar sua conta e se conectar à comunidade.</p>
        <Link to="/login" className="font-semibold text-teal-700 underline underline-offset-4">Voltar para o login</Link>
      </div>
    </main>
  )
}

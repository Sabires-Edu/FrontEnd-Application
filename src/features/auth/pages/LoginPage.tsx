import { KnowledgeOrbit } from '../components/KnowledgeOrbit'
import { LoginForm } from '../components/LoginForm'
import '../auth.css'

export function LoginPage() {
  return (
    <main className="sabires-auth grid min-h-dvh lg:grid-cols-2">
      <KnowledgeOrbit />
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-12">
        <div className="sabires-heading text-xl font-semibold tracking-tight">Sabires<span className="text-teal-600">.</span></div>
        <div className="flex flex-1 items-center py-12"><LoginForm /></div>
        <p className="text-center text-xs text-slate-600">Aprender. Compartilhar. Fazer parte.</p>
      </section>
    </main>
  )
}

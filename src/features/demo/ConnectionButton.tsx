import { Plus, Undo2 } from 'lucide-react'
import { useDemoSession } from './demoContext'

export function ConnectionButton({ userId, onNotice }: { userId: string; onNotice: (message: string) => void }) {
  const { connectionIds, toggleConnection } = useDemoSession()
  const requested = connectionIds.includes(userId)
  return <button className="feed-connect" aria-pressed={requested} aria-label={requested ? 'Desfazer solicitação simulada' : 'Conectar'} onClick={() => {
    toggleConnection(userId)
    onNotice(requested ? 'Solicitação simulada desfeita nesta demonstração.' : 'Solicitação simulada. Nada foi enviado ou salvo.')
  }}>{requested ? <Undo2 size={15} /> : <Plus size={15} />}{requested ? 'Solicitação simulada · Desfazer' : 'Conectar'}</button>
}

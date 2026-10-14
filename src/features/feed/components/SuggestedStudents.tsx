import { ArrowUpRight, Sprout } from 'lucide-react'
import { GlowCard } from '../../../components/ui/spotlight-card'
import { mockStudents } from '../data/mockFeed'
import { Avatar } from './Avatar'
import { Link } from 'react-router-dom'
import { ConnectionButton } from '../../demo/ConnectionButton'

// Profile Card discovery pattern, reduced to compact identity/bio/follow rows.
export function SuggestedStudents({ onNotice, onCompose }: { onNotice: (message: string) => void; onCompose: () => void }) {
  return <div className="feed-discovery-content"><section className="feed-panel feed-suggestions" aria-labelledby="suggested-title"><div className="feed-section-heading"><h2 id="suggested-title">Gente para conhecer</h2><UsersSymbol /></div><p>Novas perspectivas começam<br />com uma conexão.</p>{mockStudents.map(student => <div className="feed-student" key={student.id}><Link to={`/profile/${student.id}`} aria-label={`Ver perfil de ${student.name}`}><Avatar student={student} small /></Link><div><Link to={`/profile/${student.id}`}><strong>{student.name}</strong></Link><p>{student.course} · {student.institution}</p><span>{student.interest}</span><details><summary>Sobre</summary><p>{student.bio}</p></details><ConnectionButton userId={student.id} onNotice={onNotice} /></div></div>)}<p className="feed-caption">Perfis fictícios · Sugestões de exemplo</p></section>
    <GlowCard glowColor="teal" customSize width="100%" className="feed-spotlight"><span className="feed-eyebrow"><Sprout size={16} />SABER CONECTA</span><h2>Você sabe algo que<br />alguém quer aprender.</h2><p>Compartilhe uma descoberta, uma dúvida ou aquele jeito diferente de resolver um problema.</p><button className="feed-text-button" onClick={onCompose}>Comece uma conversa <ArrowUpRight size={16} /></button></GlowCard>
    <section className="feed-topics" aria-label="Assuntos da comunidade"><h2>Ideias que aproximam</h2><p>Para inspirar sua próxima publicação</p><span>#RotinaDeEstudos</span><span>#MeuPrimeiroProjeto</span><span>#VidaUniversitária</span></section>
  </div>
}

function UsersSymbol() { return <span className="feed-lime-dot" aria-hidden="true" /> }

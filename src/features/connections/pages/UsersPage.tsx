import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, MessageCircle, Search, UserRoundSearch, Users } from 'lucide-react'
import { CommunityShell } from '../../../components/layout/CommunityShell'
import { useDemoSession } from '../../demo/demoContext'
import { ConnectionButton } from '../../demo/ConnectionButton'
import { Avatar } from '../../feed/components/Avatar'
import { mockPublicProfiles } from '../../profile/data/mockProfiles'

export function UsersPage() {
  const { connectionIds } = useDemoSession()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'requested'>('all')
  const [notice, setNotice] = useState('')
  const normalized = query.toLocaleLowerCase('pt-BR').trim()
  const users = mockPublicProfiles.filter(student => (filter === 'all' || connectionIds.includes(student.id)) &&
    [student.name, student.course, student.institution, student.biography, ...student.interests].some(value => value.toLocaleLowerCase('pt-BR').includes(normalized)))
  return <CommunityShell view="users" eyebrow="CONEXÕES QUE AMPLIAM HORIZONTES" title="Encontre pessoas para aprender junto." notice={notice} onNotice={setNotice}>
    <section className="community-stats" aria-label="Resumo de usuários"><div><Users size={20} /><strong>{mockPublicProfiles.length}</strong><span>perfis de exemplo</span></div><div><UserRoundSearch size={20} /><strong>{connectionIds.length}</strong><span>convites simulados</span></div></section>
    <section className="feed-panel community-search-panel" aria-label="Pesquisar usuários"><label htmlFor="users-search">Pesquisar estudantes</label><div className="community-search-box"><Search size={19} aria-hidden="true" /><input id="users-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome, curso, instituição ou interesse" /></div></section>
    <div className="community-tabs" role="group" aria-label="Filtrar usuários"><button className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todos os usuários</button><button className={filter === 'requested' ? 'active' : ''} aria-pressed={filter === 'requested'} onClick={() => setFilter('requested')}>Convites enviados ({connectionIds.length})</button></div>
    {users.length ? <div className="community-users-grid" data-motion-view={filter}>{users.map(student => <article className="feed-panel community-user-card" key={student.id}>
      <div className="community-user-heading"><Link to={`/profile/${student.id}`} aria-label={`Ver perfil de ${student.name}`}><Avatar student={student} /></Link><div><h2><Link to={`/profile/${student.id}`}>{student.name}</Link></h2><p><GraduationCap size={15} />{student.course} · {student.institution}</p></div></div>
      <p className="community-user-bio">{student.biography}</p><div className="community-pills">{student.interests.map(interest => <span key={interest}>{interest}</span>)}</div>
      <div className="community-user-actions"><ConnectionButton userId={student.id} onNotice={setNotice} /><Link className="community-outline-link" to={`/mensagens?conversa=direct-${student.id}`}><MessageCircle size={16} />Mensagem</Link></div>
    </article>)}</div> : <section className="feed-panel feed-empty" data-motion-view={filter}><UserRoundSearch size={28} /><h2>Nenhum usuário encontrado</h2><p>Tente outro termo ou volte para todos os usuários.</p><button className="feed-primary" onClick={() => { setQuery(''); setFilter('all') }}>Limpar filtros</button></section>}
    <p className="feed-end">Os perfis e convites apresentados são apenas demonstrativos.</p>
  </CommunityShell>
}

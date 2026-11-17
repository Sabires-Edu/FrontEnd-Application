import { Bookmark, ChevronLeft, FileText, GraduationCap, Home, LogOut, MessageCircle, UserRound, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDemoSession } from '../../demo/demoContext'
import { Avatar } from './Avatar'

interface Props { open: boolean; collapsed: boolean; view: 'all' | 'saved' | 'students' | 'profile' | 'users' | 'posts' | 'messages'; onCollapse: () => void; onSelect: (view: 'all' | 'saved' | 'students') => void; onNotice: (message: string) => void }
// Aceternity Sidebar pattern, recreated with explicit keyboard-friendly controls.
export function FeedSidebar({ open, collapsed, view, onCollapse, onSelect }: Props) {
  const { viewer: mockViewer } = useDemoSession()
  const navigate = useNavigate()

  function handleLogout() {
  localStorage.removeItem('sabires_token')
  navigate('/login', { replace: true })
}
  return <aside id="feed-navigation" className={`feed-sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="feed-mini-profile"><Link to="/profile" aria-label="Meu perfil"><Avatar student={mockViewer} /></Link><div className="feed-sidebar-label"><Link to="/profile"><strong>{mockViewer.name}</strong></Link><p>{mockViewer.course}</p><span>{mockViewer.institution} · Perfil demonstrativo</span></div></div>
    <nav aria-label="Navegação principal">
      <button title="Meu feed" className={view === 'all' ? 'active' : ''} aria-current={view === 'all' ? 'page' : undefined} onClick={() => onSelect('all')}><Home size={20} /><span className="feed-sidebar-label">Meu feed</span></button>
      <Link to="/profile" title="Perfil" className={view === 'profile' ? 'active' : ''} aria-current={view === 'profile' ? 'page' : undefined}><UserRound size={20} /><span className="feed-sidebar-label">Perfil</span></Link>
      <Link to="/usuarios" title="Usuários" className={view === 'users' || view === 'students' ? 'active' : ''} aria-current={view === 'users' || view === 'students' ? 'page' : undefined}><Users size={20} /><span className="feed-sidebar-label">Usuários</span></Link>
      <Link to="/mensagens" title="Mensagens" className={view === 'messages' ? 'active' : ''} aria-current={view === 'messages' ? 'page' : undefined}><MessageCircle size={20} /><span className="feed-sidebar-label">Mensagens</span></Link>
      <Link to="/postagens" title="Postagens" className={view === 'posts' ? 'active' : ''} aria-current={view === 'posts' ? 'page' : undefined}><FileText size={20} /><span className="feed-sidebar-label">Postagens</span></Link>
      <button title="Salvos nesta sessão" className={view === 'saved' ? 'active' : ''} aria-current={view === 'saved' ? 'page' : undefined} onClick={() => onSelect('saved')}><Bookmark size={20} /><span className="feed-sidebar-label">Salvos nesta sessão</span></button>
      <button
      
      onClick={handleLogout}
      title="Sair da conta">
      <LogOut size={20} />
      <span className="feed-sidebar-label">Sair</span>
    </button>

    </nav>
    <div className="feed-sidebar-note feed-sidebar-label"><GraduationCap size={24} /><strong>Conhecimento cresce<br />quando é compartilhado.</strong><p>Uma dúvida sua pode começar<br />uma boa conversa.</p></div>
    <button className="feed-collapse" onClick={onCollapse} aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'} aria-expanded={!collapsed}><ChevronLeft size={18} /><span className="feed-sidebar-label">Recolher menu</span></button>
    


    <p className="feed-sidebar-footer feed-sidebar-label">Sabires © 2026<br />Aprender. Compartilhar. Fazer parte.</p>
  </aside>
}

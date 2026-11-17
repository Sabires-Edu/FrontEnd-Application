import { Bell, Home, Menu, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoSession } from '../../demo/demoContext'
import { Avatar } from './Avatar'

interface Props { view: 'all' | 'saved' | 'students' | 'profile' | 'users' | 'posts' | 'messages'; onHome: () => void; menuOpen: boolean; onMenu: () => void; onNotice: (message: string) => void; onStudents: () => void }
export function FeedHeader({ view, onHome, menuOpen, onMenu, onNotice, onStudents }: Props) {
  const { viewer: mockViewer } = useDemoSession()
  return <header className="feed-header">
    <div className="feed-header-inner">
      <Link className="feed-brand" to="/feed" onClick={onHome} aria-label="Sabires — início">Sabires<span>.</span></Link>
      <div className="feed-search"><Search size={18} aria-hidden="true" /><input aria-label="Busca em desenvolvimento" placeholder="Buscar pessoas e conhecimentos" readOnly onClick={() => onNotice('A busca está em desenvolvimento.')} /><span>Em breve</span></div>
      <nav className="feed-top-nav" aria-label="Atalhos">
        <Link to="/feed" onClick={onHome} className={view === 'all' ? 'active' : ''} aria-current={view === 'all' ? 'page' : undefined}><Home size={21} /><span>Início</span></Link>
        <button onClick={onStudents} className={view === 'students' || view === 'users' ? 'active' : ''} aria-current={view === 'students' || view === 'users' ? 'page' : undefined}><Users size={21} /><span>Estudantes</span></button>
      </nav>
      <button className="feed-icon-button" aria-label="Notificações" onClick={() => onNotice('As notificações estarão disponíveis quando a integração estiver pronta.')}><Bell size={21} /></button>
      <Link className="feed-account" to="/profile" aria-label="Meu perfil" aria-current={view === 'profile' ? 'page' : undefined}><Avatar student={mockViewer} small /></Link>
      <button className="feed-icon-button feed-menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="feed-navigation" onClick={onMenu}><Menu size={22} /></button>
    </div>
  </header>
}

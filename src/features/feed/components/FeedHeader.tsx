import { Bell, Home, Menu, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mockViewer } from '../data/mockFeed'
import { Avatar } from './Avatar'

interface Props { view: 'all' | 'saved' | 'students'; onHome: () => void; menuOpen: boolean; onMenu: () => void; onNotice: (message: string) => void; onStudents: () => void }
export function FeedHeader({ view, onHome, menuOpen, onMenu, onNotice, onStudents }: Props) {
  return <header className="feed-header">
    <div className="feed-header-inner">
      <Link className="feed-brand" to="/feed" onClick={onHome} aria-label="Sabires — início">Sabires<span>.</span></Link>
      <div className="feed-search"><Search size={18} aria-hidden="true" /><input aria-label="Busca em desenvolvimento" placeholder="Buscar pessoas e conhecimentos" readOnly onClick={() => onNotice('A busca está em desenvolvimento.')} /><span>Em breve</span></div>
      <nav className="feed-top-nav" aria-label="Atalhos">
        <Link to="/feed" onClick={onHome} className={view === 'all' ? 'active' : ''} aria-current={view === 'all' ? 'page' : undefined}><Home size={21} /><span>Início</span></Link>
        <button onClick={onStudents} className={view === 'students' ? 'active' : ''} aria-current={view === 'students' ? 'page' : undefined}><Users size={21} /><span>Estudantes</span></button>
      </nav>
      <button className="feed-icon-button" aria-label="Notificações" onClick={() => onNotice('As notificações estarão disponíveis quando a integração estiver pronta.')}><Bell size={21} /></button>
      <button className="feed-account" aria-label="Alex Santos — perfil de demonstração" onClick={() => onNotice('Alex Santos é um perfil fictício de demonstração. A página de perfil está em desenvolvimento.')}><Avatar student={mockViewer} small /></button>
      <button className="feed-icon-button feed-menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="feed-navigation" onClick={onMenu}><Menu size={22} /></button>
    </div>
  </header>
}

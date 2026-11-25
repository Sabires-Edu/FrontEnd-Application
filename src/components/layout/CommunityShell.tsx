import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, X } from 'lucide-react'
import { FeedHeader } from '../../features/feed/components/FeedHeader'
import { FeedSidebar } from '../../features/feed/components/FeedSidebar'
import '../../features/feed/feed.css'
import './community.css'

type CommunityView = 'users' | 'posts' | 'messages' | 'requests' | 'trash'
interface Props {
  view: CommunityView
  eyebrow: string
  title: string
  notice: string
  onNotice: (message: string) => void
  children: ReactNode
  showDemoNotice?: boolean
}

export function CommunityShell({ view, eyebrow, title, notice, onNotice, children,showDemoNotice = true,}: Props) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <div className="sabires-feed sabires-community" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); onNotice('') } }}>
    <a className="feed-skip-link" href="#community-main">Pular para o conteúdo</a>
    <FeedHeader view={view} onHome={() => navigate('/feed')} onStudents={() => navigate('/usuarios')} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} onNotice={onNotice} />
    <div className={`feed-layout community-layout ${collapsed ? 'feed-layout--collapsed' : ''}`}>
      <FeedSidebar view={view} open={menuOpen} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} onSelect={next => navigate(next === 'all' ? '/feed' : next === 'students' ? '/usuarios' : `/feed?view=${next}`)} onNotice={onNotice} />
      <main id="community-main" className="feed-main" tabIndex={-1}>
        <div className="feed-page-heading"><div><p className="feed-eyebrow">{eyebrow}</p><h1>{title}</h1></div><span className="feed-heading-mark" aria-hidden="true">✳</span></div>
        {showDemoNotice && (
    <div className="feed-demo-notice">
        <Info size={15} />
        <span>
            Modo demonstração: conteúdos e conversas fictícios. Interações ficam apenas nesta navegação e desaparecem ao recarregar.
        </span>
    </div>
)}
        {children}
      </main>
    </div>
    <div className="feed-toast-region" role="status" aria-live="polite" aria-atomic="true">{notice && <div className="feed-toast"><Info size={20} /><p>{notice}</p><button className="feed-icon-button" aria-label="Fechar aviso" onClick={() => onNotice('')}><X size={18} /></button></div>}</div>
  </div>
}

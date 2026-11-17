import { useEffect, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import { FeedHeader } from '../components/FeedHeader'
import { FeedSidebar } from '../components/FeedSidebar'
import { PostComposer } from '../components/PostComposer'
import { SuggestedStudents } from '../components/SuggestedStudents'
import { FeedContent } from '../components/FeedContent'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDemoSession } from '../../demo/demoContext'
import type { DemoPostDraft } from '../types/feed.types'
import '../feed.css'

// Public development preview. No API calls, token reads or auth assumptions.
export function FeedPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [view, setView] = useState<'all' | 'saved' | 'students'>(() => params.get('view') === 'students' ? 'students' : params.get('view') === 'saved' ? 'saved' : 'all')
  const session = useDemoSession()
  const { posts, savedIds, likedIds } = session
  const [notice, setNotice] = useState('')
  const [noticeVersion, setNoticeVersion] = useState(0)
  const mainRef = useRef<HTMLElement>(null)
  const [composeRequested, setComposeRequested] = useState(false)
  useEffect(() => {
    if (composeRequested) mainRef.current?.querySelector<HTMLTextAreaElement>('#feed-composer textarea')?.focus()
  }, [composeRequested])
  useEffect(() => {
    const previous = document.title
    document.title = 'Meu feed · Sabires'
    return () => { document.title = previous }
  }, [])
  function showNotice(message: string) { setNotice(message); setNoticeVersion(previous => previous + 1) }
  function selectView(next: typeof view) { setComposeRequested(false); setView(next); setMenuOpen(false); mainRef.current?.focus(); window.scrollTo({ top: 0 }) }
  function startConversation() { setView('all'); setComposeRequested(true); mainRef.current?.querySelector<HTMLTextAreaElement>('#feed-composer textarea')?.focus() }
  function toggleSave(id: string) {
    session.toggleSave(id)
    showNotice('Lista de salvos atualizada só nesta sessão. Ela será apagada ao recarregar a página.')
  }
  function toggleLike(id: string) {
    session.toggleLike(id)
    showNotice('Curtida alterada apenas nesta sessão de demonstração.')
  }
  function publishDemo(draft: DemoPostDraft) {
    if (!draft.text.trim() && draft.attachments.length === 0) return
    session.publish(draft)
    selectView('all')
    showNotice('Publicação adicionada ao Feed de demonstração. Não foi salva.')
  }
  return <div className="sabires-feed" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); setNotice('') } }}>
    <a className="feed-skip-link" href="#feed-main">Pular para o conteúdo</a>
    <FeedHeader view={view} onHome={() => selectView('all')} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} onNotice={showNotice} onStudents={() => navigate('/usuarios')} />
    <div className={`feed-layout ${collapsed ? 'feed-layout--collapsed' : ''}`}>
      <FeedSidebar open={menuOpen} collapsed={collapsed} view={view} onCollapse={() => setCollapsed(!collapsed)} onSelect={selectView} onNotice={showNotice} />
      <main id="feed-main" ref={mainRef} tabIndex={-1} className="feed-main">
        <div className="feed-page-heading"><div><p className="feed-eyebrow">SUA COMUNIDADE DE APRENDIZADO</p><h1>{view === 'saved' ? 'Salvos nesta sessão' : view === 'students' ? 'Encontre sua turma' : 'Boas ideias se encontram aqui.'}</h1></div><span className="feed-heading-mark" aria-hidden="true">✳</span></div>
        <div className="feed-demo-notice"><Info size={15} /><span>Modo demonstração: perfis e conteúdos de exemplo. Suas publicações e interações ficam só nesta página e desaparecem ao atualizar.</span></div>
        <div id="feed-composer" hidden={view === 'students'}><PostComposer onPublish={publishDemo} /></div>
        {view === 'students' ? <SuggestedStudents onNotice={showNotice} onCompose={startConversation} /> : <>
          <div className="feed-filter-bar"><div><button className={view === 'all' ? 'active' : ''} aria-pressed={view === 'all'} onClick={() => setView('all')}>Para você</button><button className={view === 'saved' ? 'active' : ''} aria-pressed={view === 'saved'} onClick={() => setView('saved')}>Salvos <span>{savedIds.length}</span></button></div><span>Seleção demonstrativa</span></div>
          <FeedContent view={view} state="ready" posts={view === 'saved' ? posts.filter(post => savedIds.includes(post.id)) : posts} likedIds={likedIds} onLike={toggleLike} savedIds={savedIds} onSave={toggleSave} onNotice={showNotice} onReset={() => selectView('all')} />
          <p className="feed-end">Você chegou ao fim desta seleção.<br /><span>Uma nova conversa pode começar com você.</span></p>
        </>}
      </main>
      {view !== 'students' && <aside className="feed-right" aria-label="Descubra a comunidade"><SuggestedStudents onNotice={showNotice} onCompose={startConversation} /></aside>}
    </div>
    <div className="feed-toast-region" role="status" aria-live="polite" aria-atomic="true">{notice && <div key={noticeVersion} className="feed-toast"><Info size={20} /><p>{notice}</p><button className="feed-icon-button" aria-label="Fechar aviso" onClick={() => setNotice('')}><X size={18} /></button></div>}</div>
  </div>
}

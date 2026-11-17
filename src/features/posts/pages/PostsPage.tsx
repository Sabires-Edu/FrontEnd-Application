import { useState } from 'react'
import { Bookmark, FileText, PenLine } from 'lucide-react'
import { CommunityShell } from '../../../components/layout/CommunityShell'
import { useDemoSession } from '../../demo/demoContext'
import { PostCard } from '../../feed/components/PostCard'
import { PostComposer } from '../../feed/components/PostComposer'
import type { DemoPostDraft } from '../../feed/types/feed.types'

export function PostsPage() {
  const session = useDemoSession()
  const [filter, setFilter] = useState<'all' | 'mine' | 'saved'>('all')
  const [notice, setNotice] = useState('')
  const posts = session.posts.filter(post => filter === 'all' || (filter === 'mine' ? post.author.id === session.viewer.id : session.savedIds.includes(post.id)))
  function publish(draft: DemoPostDraft) {
    session.publish(draft)
    setFilter('all')
    setNotice('Sua postagem foi criada nesta demonstração e já aparece no feed. Ela não foi enviada ao servidor.')
  }
  return <CommunityShell view="posts" eyebrow="COMPARTILHE O QUE VOCÊ APRENDE" title="Postagens da comunidade." notice={notice} onNotice={setNotice}>
    <section className="community-intro feed-panel"><PenLine size={22} /><div><h2>Compartilhe uma descoberta</h2><p>Uma pergunta, uma ideia ou um projeto podem iniciar uma ótima conversa.</p></div></section>
    <PostComposer onPublish={publish} />
    <div className="community-tabs" role="group" aria-label="Filtrar postagens">
      <button className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todas ({session.posts.length})</button>
      <button className={filter === 'mine' ? 'active' : ''} aria-pressed={filter === 'mine'} onClick={() => setFilter('mine')}>Minhas postagens</button>
      <button className={filter === 'saved' ? 'active' : ''} aria-pressed={filter === 'saved'} onClick={() => setFilter('saved')}><Bookmark size={15} /> Salvas ({session.savedIds.length})</button>
    </div>
    {posts.length ? <div className="feed-post-list" data-motion-view={filter}>{posts.map(post => <PostCard key={post.id} post={post} liked={session.likedIds.includes(post.id)} saved={session.savedIds.includes(post.id)} onLike={() => { session.toggleLike(post.id); setNotice('Curtida registrada apenas nesta demonstração.') }} onSave={() => { session.toggleSave(post.id); setNotice('Lista de salvos atualizada apenas nesta demonstração.') }} onNotice={setNotice} />)}</div> : <section className="feed-panel feed-empty" data-motion-view={filter}><FileText size={28} /><h2>{filter === 'mine' ? 'Você ainda não publicou' : filter === 'saved' ? 'Nenhuma postagem salva' : 'Nenhuma postagem por aqui'}</h2><p>{filter === 'mine' ? 'Use o campo acima para criar sua primeira publicação.' : filter === 'saved' ? 'Salve uma postagem da comunidade para encontrá-la aqui.' : 'Volte ao feed para explorar a comunidade.'}</p><button className="feed-primary" onClick={() => setFilter('all')}>Ver todas</button></section>}
    <p className="feed-end">As postagens criadas aqui também aparecem no feed e no seu perfil durante esta navegação.</p>
  </CommunityShell>
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Info, X } from 'lucide-react'
import { FeedHeader } from '../../feed/components/FeedHeader'
import { FeedSidebar } from '../../feed/components/FeedSidebar'
import { PostCard } from '../../feed/components/PostCard'
import { Avatar } from '../../feed/components/Avatar'
import { ConnectionButton } from '../../demo/ConnectionButton'
import { useDemoSession } from '../../demo/demoContext'
import { mockPublicProfiles } from '../data/mockProfiles'
import { ProfileHeader } from '../components/ProfileHeader'
import { ProfileEditor } from '../components/ProfileEditor'
import '../../feed/feed.css'
import '../profile.css'

export function ProfilePage() {
  const { userId } = useParams()
  // Remount view-only state on profile changes; shared demo state stays intact.
  return <ProfileView key={userId ?? 'me'} userId={userId} />
}

function ProfileView({ userId }: { userId?: string }) {
  const session = useDemoSession()
  const { viewer, posts, likedIds, savedIds, connectionIds } = session
  const own = !userId || userId === viewer.id
  const profile = own ? viewer : mockPublicProfiles.find(student => student.id === userId)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<'posts' | 'about' | 'connections'>('posts')
  const [editing, setEditing] = useState<false | 'details' | 'photo'>(false)
  const [notice, setNotice] = useState({ text: '', version: 0 })
  const mainRef = useRef<HTMLElement>(null)
  function showNotice(text: string) { setNotice(previous => ({ text, version: previous.version + 1 })) }
  useEffect(() => {
    const previous = document.title
    document.title = `${profile?.name ?? 'Perfil não encontrado'} · Sabires`
    return () => { document.title = previous }
  }, [profile?.name])
  useEffect(() => { mainRef.current?.focus(); window.scrollTo({ top: 0 }) }, [])
  const studentPosts = posts.filter(post => post.author.id === profile?.id)
  const tabs = [{ id: 'posts', label: 'Publicações' }, { id: 'about', label: 'Sobre' }, ...(own ? [{ id: 'connections', label: 'Conexões' }] : [])] as const
  function selectTab(id: string) { if (id === 'posts' || id === 'about' || id === 'connections') setTab(id) }

  return <div className="sabires-feed sabires-profile">
    <a className="feed-skip-link" href="#profile-main">Pular para o perfil</a>
    <FeedHeader view="profile" onHome={() => navigate('/feed')} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} onNotice={showNotice} onStudents={() => navigate('/feed?view=students')} />
    <div className={`feed-layout profile-layout ${collapsed ? 'feed-layout--collapsed' : ''}`}>
      <FeedSidebar view="profile" open={menuOpen} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} onSelect={view => navigate(view === 'all' ? '/feed' : `/feed?view=${view}`)} onNotice={showNotice} />
      <main id="profile-main" ref={mainRef} tabIndex={-1} className="feed-main">
        <Link to="/feed" className="profile-back"><ArrowLeft size={16} />Voltar ao feed</Link>
        <div className="feed-demo-notice"><Info size={15} /><span>Perfil demonstrativo. Alterações e solicitações ficam só nesta navegação e desaparecem ao atualizar.</span></div>
        {!profile ? <section className="feed-panel feed-empty"><BookOpen size={30} /><h1>Perfil não encontrado</h1><p>Não há um estudante demonstrativo com esse identificador.</p><Link className="feed-primary" to="/feed?view=students">Conhecer estudantes</Link></section> : <>
          <ProfileHeader profile={profile} own={own} onEdit={photo => setEditing(photo ? 'photo' : 'details')} onNotice={showNotice} />
          <div className="profile-tabs" role="tablist" aria-label="Seções do perfil" onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const index = tabs.findIndex(item => item.id === tab)
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
            selectTab(tabs[next].id)
            document.getElementById(`profile-tab-${tabs[next].id}`)?.focus()
          }}>{tabs.map(item => <button key={item.id} role="tab" id={`profile-tab-${item.id}`} aria-selected={tab === item.id} aria-controls="profile-tabpanel" tabIndex={tab === item.id ? 0 : -1} onClick={() => selectTab(item.id)}>{item.label}{item.id === 'posts' && <span>{studentPosts.length}</span>}</button>)}</div>
          <div className="profile-columns"><section id="profile-tabpanel" role="tabpanel" aria-labelledby={`profile-tab-${tab}`} tabIndex={0}>
            {tab === 'posts' && <>{studentPosts.length ? <div className="feed-post-list">{studentPosts.map(post => <PostCard key={post.id} post={post} liked={likedIds.includes(post.id)} saved={savedIds.includes(post.id)} onLike={() => { session.toggleLike(post.id); showNotice('Curtida alterada apenas nesta demonstração.') }} onSave={() => { session.toggleSave(post.id); showNotice('Salvos atualizados apenas nesta demonstração.') }} onNotice={showNotice} />)}</div> : <div className="feed-panel feed-empty"><BookOpen size={28} /><h2>{own ? 'Sua primeira conversa começa aqui' : 'Ainda não há publicações'}</h2><p>{own ? 'Compartilhe uma descoberta no feed. Ela também aparecerá no seu perfil durante esta demonstração.' : 'Este estudante ainda não tem publicações nesta demonstração.'}</p>{own && <Link to="/feed" className="feed-primary">Compartilhar no feed</Link>}</div>}</>}
            {tab === 'about' && <section className="feed-panel profile-about"><h2>Sobre {own ? 'você' : profile.name.split(' ')[0]}</h2><p className="profile-bio">{profile.biography || 'Nenhuma biografia preenchida. Um pouco sobre você pode começar uma boa conversa.'}</p><h3>Interesses de estudo</h3><div className="profile-interests">{profile.interests.map(interest => <span key={interest}>{interest}</span>)}</div><h3>Vida acadêmica · Exemplo</h3><p>{profile.course}<br />{profile.institution}</p>{own && <div className="profile-private"><h3>Informações privadas da demonstração</h3><dl><dt>E-mail</dt><dd>{viewer.email}</dd><dt>Nascimento</dt><dd>{viewer.birthDate ? viewer.birthDate.split('-').reverse().join('/') : 'Não informado'}</dd></dl><p>Essas informações não aparecem nos perfis de outros estudantes.</p></div>}</section>}
            {tab === 'connections' && own && <section className="feed-panel profile-about"><h2>Solicitações simuladas</h2><p>Nenhuma conexão real foi criada. Você pode desfazer suas solicitações abaixo.</p>{connectionIds.length ? mockPublicProfiles.filter(student => connectionIds.includes(student.id)).map(student => <div key={student.id} className="profile-connection"><Link to={`/profile/${student.id}`}><Avatar student={student} /><strong>{student.name}</strong></Link><ConnectionButton userId={student.id} onNotice={showNotice} /></div>) : <div className="profile-connection-empty"><p>Você ainda não simulou uma solicitação.</p><Link to="/feed?view=students" className="feed-text-button">Encontrar estudantes</Link></div>}</section>}
          </section><aside className="feed-panel profile-summary" aria-label="Apresentação acadêmica"><p className="feed-eyebrow">APRENDER EM COMUNIDADE</p><h2>Ideias que aproximam</h2><p>{own ? 'Um interesse em comum pode ser o começo de uma troca.' : 'Conheça os assuntos que fazem parte da jornada deste estudante.'}</p><div className="profile-interests">{profile.interests.map(interest => <span key={interest}>{interest}</span>)}</div><div className="profile-summary-school"><strong>{profile.institution}</strong><span>{profile.course}</span><small>Informações acadêmicas demonstrativas</small></div></aside></div>
        </>}
      </main>
    </div>
    <div className="feed-toast-region" role="status" aria-live="polite" aria-atomic="true">{notice.text && <div key={notice.version} className="feed-toast"><Info size={20} /><p>{notice.text}</p><button className="feed-icon-button" aria-label="Fechar aviso" onClick={() => showNotice('')}><X size={18} /></button></div>}</div>
    {own && editing && <ProfileEditor profile={viewer} focusPhoto={editing === 'photo'} onCancel={() => setEditing(false)} onSave={(details, photo) => { session.updateProfile(details, photo); setEditing(false); showNotice('Alterações aplicadas nesta demonstração. Os dados não foram salvos.') }} />}
  </div>
}

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Search, Send, Users, UserRound } from 'lucide-react'
import { CommunityShell } from '../../../components/layout/CommunityShell'
import { useDemoSession } from '../../demo/demoContext'
import { Avatar } from '../../feed/components/Avatar'
import { mockStudents } from '../../feed/data/mockFeed'

export function MessagesPage() {
  const { viewer, conversations, sendMessage } = useDemoSession()
  const [params, setParams] = useSearchParams()
  const activeId = params.get('conversa')
  const activeChat = conversations.find(chat => chat.id === activeId) ?? conversations[0]
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'direct' | 'group'>('all')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const draft = drafts[activeChat?.id ?? ''] ?? ''
  function setDraft(value: string) {
    if (activeChat) setDrafts(previous => ({ ...previous, [activeChat.id]: value }))
  }
  const [notice, setNotice] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const filtered = conversations.filter(chat => (typeFilter === 'all' || chat.kind === typeFilter) && chat.title.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR').trim()))

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [activeChat?.id, activeChat?.messages.length])
  function selectConversation(id: string) { setParams({ conversa: id }) }
  function send() {
    if (!activeChat || !draft.trim()) return
    sendMessage(activeChat.id, draft)
    setDraft('')
    setNotice('Mensagem adicionada a esta conversa demonstrativa. Nenhuma mensagem real foi enviada.')
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); send() }
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }
  const chatPerson = activeChat?.kind === 'direct' ? mockStudents.find(student => activeChat.participantIds.includes(student.id)) : undefined
  return <CommunityShell view="messages" eyebrow="BOAS CONVERSAS GERAM CONHECIMENTO" title="Suas mensagens." notice={notice} onNotice={setNotice}>
    <div className="community-messages feed-panel">
      <section className="community-chat-sidebar" aria-label="Conversas"><div className="community-chat-sidebar-head"><h2>Conversas</h2><span>{conversations.length}</span></div>
        <label className="community-chat-search"><Search size={16} /><span className="feed-sr-only">Pesquisar conversas</span><input placeholder="Buscar conversa" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <div className="community-chat-filters" role="group" aria-label="Filtrar conversas"><button className={typeFilter === 'all' ? 'active' : ''} aria-pressed={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>Todas</button><button className={typeFilter === 'direct' ? 'active' : ''} aria-pressed={typeFilter === 'direct'} onClick={() => setTypeFilter('direct')}>Privadas</button><button className={typeFilter === 'group' ? 'active' : ''} aria-pressed={typeFilter === 'group'} onClick={() => setTypeFilter('group')}>Grupos</button></div>
        <div className="community-chat-list" data-motion-view={typeFilter}>{filtered.length ? filtered.map(chat => {
          const student = chat.kind === 'direct' ? mockStudents.find(item => chat.participantIds.includes(item.id)) : undefined
          const preview = chat.messages.at(-1)?.text ?? 'Inicie a conversa'
          return <button key={chat.id} className={`community-chat-item ${activeChat?.id === chat.id ? 'active' : ''}`} aria-pressed={activeChat?.id === chat.id} onClick={() => selectConversation(chat.id)}>
            {student ? <Avatar student={student} small /> : <span className="community-chat-group-icon"><Users size={19} /></span>}
            <span className="community-chat-item-copy"><strong>{chat.title}</strong><small>{preview}</small></span><span className="community-chat-time">{chat.messages.at(-1)?.time}</span>
          </button>
        }) : <p className="community-chat-no-results">Nenhuma conversa encontrada.</p>}</div>
        <p className="community-chat-help">Quer conhecer mais pessoas? <Link to="/usuarios">Ver usuários</Link></p>
      </section>
      <section className="community-chat-pane" aria-label="Mensagens da conversa ativa">
        {activeChat ? <>
          <header key={`header-${activeChat.id}`} className="community-chat-header"><div className="community-chat-heading"><span className="community-chat-heading-icon">{chatPerson ? <Avatar student={chatPerson} small /> : <Users size={21} />}</span><div><h2>{activeChat.title}</h2><p>{activeChat.subtitle}</p></div></div><span className="community-chat-type">{activeChat.kind === 'group' ? 'Grupo' : 'Privado'} · Demo</span></header>
          <div key={activeChat.id} className="community-chat-messages"><div className="community-chat-date">Conversa de exemplo</div><ol>{activeChat.messages.map(message => {
            const mine = message.senderId === viewer.id
            const author = mine ? viewer : mockStudents.find(student => student.id === message.senderId)
            return <li key={message.id} className={`community-chat-message ${mine ? 'mine' : ''}`}><div className="community-chat-bubble">{!mine && activeChat.kind === 'group' && <strong>{author?.name ?? 'Participante'}</strong>}<p>{message.text}</p><time>{message.time}</time></div></li>
          })}</ol><div ref={endRef} /></div>
          <form onSubmit={handleSubmit} className="community-chat-form"><label htmlFor="message-text" className="feed-sr-only">Escrever mensagem para {activeChat.title}</label><textarea id="message-text" placeholder="Escreva sua mensagem..." rows={2} value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} onKeyDown={handleKeyDown} /><button className="feed-primary" type="submit" disabled={!draft.trim()} aria-label="Enviar mensagem de demonstração"><Send size={18} /><span>Enviar</span></button><small>Enter envia · Shift + Enter quebra linha · Apenas demonstração</small></form>
        </> : <div className="feed-empty"><MessageCircle size={30} /><p>Escolha uma conversa para começar.</p></div>}
      </section>
    </div>
    <div className="community-mobile-return"><Link to="/usuarios"><ArrowLeft size={16} />Conhecer mais estudantes</Link><span><UserRound size={15} /> Chats e grupos simulados</span></div>
  </CommunityShell>
}

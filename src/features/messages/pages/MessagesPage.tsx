
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import { Link, useSearchParams } from 'react-router-dom'

import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send,
  Users,
  UserRound,
} from 'lucide-react'

import { CommunityShell } from '../../../components/layout/CommunityShell'

import {
  getMyChats,
  getChatMessages,
  sendMessage,
} from '../service/chatService'

import { supabase } from '../service/supabaseClient'

import type {
  Chat,
  ChatMessage,
} from '../types/chat.types'

// Identificar o usuário autenticado pelo JWT
function getCurrentUserId(): string | null {
  const token = localStorage.getItem('sabires_token')

  if (!token) return null

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1])
    )

    return payload.sub ?? null
  } catch {
    return null
  }
}

// Organizar mensagens por ordem de envio
function sortMessages(data: ChatMessage[]): ChatMessage[] {
  return [...data]
    .filter(message => !message.deletedat)
    .sort(
      (a, b) =>
        new Date(a.sentat).getTime() -
        new Date(b.sentat).getTime(),
    )
}

export function MessagesPage() {
  // Estados principais
  const [conversations, setConversations] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'direct' | 'group'>('all')

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  // ID do usuário autenticado
  const currentUserId = getCurrentUserId()

  const [params, setParams] = useSearchParams()

  const activeId = params.get('conversa')

const activeChat = activeId
  ? conversations.find(
      chat => String(chat.chatid) === activeId,
    )
  : conversations[0]

  const draft = drafts[String(activeChat?.chatid ?? '')] ?? ''

  const endRef = useRef<HTMLDivElement>(null)

  // Atualizar o texto digitado
  function setDraft(value: string) {
    if (!activeChat) return

    setDrafts(previous => ({
      ...previous,
      [String(activeChat.chatid)]: value,
    }))
  }

  // Buscar conversas do usuário
  useEffect(() => {
    let cancelled = false

    async function loadConversations() {
      try {
        setLoading(true)

        const data = await getMyChats()

        if (!cancelled) {
          setConversations(data)
        }
      } catch (error) {
        console.error('Erro ao carregar conversas:', error)

        if (!cancelled) {
          setNotice('Não foi possível carregar suas conversas.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadConversations()

    return () => {
      cancelled = true
    }
  }, [])

  // Buscar mensagens da conversa selecionada
  useEffect(() => {
    if (!activeChat) {
      setMessages([])
      return
    }

    let cancelled = false

    async function loadMessages() {
      try {
        setMessagesLoading(true)

        const data = await getChatMessages(activeChat!.chatid)

        if (!cancelled) {
          setMessages(sortMessages(data))
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error)

        if (!cancelled) {
          setMessages([])
          setNotice('Não foi possível carregar as mensagens.')
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false)
        }
      }
    }

    loadMessages()

    return () => {
      cancelled = true
    }
  }, [activeChat?.chatid])

  // Conectar ao Supabase Realtime para receber novas mensagens
  useEffect(() => {
    if (!activeChat) return

    const chatId = activeChat.chatid
    const token = localStorage.getItem('sabires_token')

    if (!token) {
      console.error('Token de autenticação não encontrado.')
      return
    }

    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function connectRealtime() {
      try {
        // Autenticar a conexão Realtime com o JWT do usuário
        await supabase.realtime.setAuth(token!)

        if (cancelled) return

        // Criar canal exclusivo para a conversa selecionada
        channel = supabase
          .channel(`chat-${chatId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'message',
              filter: `chatid=eq.${chatId}`,
            },
            async () => {
              if (cancelled) return

              try {
                // Buscar as mensagens completas pela API
                const updatedMessages = await getChatMessages(chatId)

                if (!cancelled) {
                  setMessages(sortMessages(updatedMessages))
                }
              } catch (error) {
                console.error(
                  'Erro ao atualizar mensagens pelo Realtime:',
                  error,
                )
              }
            },
          )
          .subscribe((status, error) => {
            console.log(`Realtime do chat ${chatId}:`, status)

            if (error) {
              console.error('Erro na conexão Realtime:', error)
            }
          })
      } catch (error) {
        console.error('Erro ao conectar ao Supabase Realtime:', error)
      }
    }

    connectRealtime()

    // Encerrar a assinatura ao trocar de conversa ou sair da página
    return () => {
      cancelled = true

      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [activeChat?.chatid])

  // Rolar para a última mensagem
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeChat?.chatid, messages.length])

  // Filtrar conversas
  const filtered = conversations.filter(chat => {
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'direct' && chat.chattypeid === 1) ||
      (typeFilter === 'group' && chat.chattypeid === 2)

    const matchesSearch = chat.chatname
      .toLocaleLowerCase('pt-BR')
      .includes(query.toLocaleLowerCase('pt-BR').trim())

    return matchesType && matchesSearch
  })

  // Selecionar conversa
  function selectConversation(id: number) {
    setParams({ conversa: String(id) })
  }

  // Formatar horário da mensagem
  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Formatar data da mensagem
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Enviar mensagem pela API
  async function send() {
    if (!activeChat || !draft.trim() || sending) return

    const chatId = activeChat.chatid
    const content = draft.trim()

    try {
      setSending(true)
      setNotice('')

      // Enviar mensagem
      await sendMessage(chatId, content)

      // Limpar o campo somente se ele ainda tiver o texto enviado
      setDrafts(previous => {
        const currentDraft = previous[String(chatId)]

        if (currentDraft?.trim() !== content) {
          return previous
        }

        return {
          ...previous,
          [String(chatId)]: '',
        }
      })

      setNotice('Mensagem enviada com sucesso.')

      // Atualizar mensagens da conversa
      try {
        const updatedMessages = await getChatMessages(chatId)

        if (activeChat?.chatid === chatId) {
          setMessages(sortMessages(updatedMessages))
        }
      } catch (refreshError) {
        console.error(
          'Mensagem enviada, mas não foi possível atualizar a conversa:',
          refreshError,
        )

        setNotice(
          'Mensagem enviada, mas não foi possível atualizar a conversa. Recarregue as mensagens.',
        )
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)

      setNotice('Não foi possível enviar a mensagem. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    send()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <CommunityShell
      view="messages"
      eyebrow="BOAS CONVERSAS GERAM CONHECIMENTO"
      title="Suas mensagens."
      notice={notice}
      onNotice={setNotice}
        showDemoNotice={false}

    >
      <div className="community-messages feed-panel">

        {/* Lista de conversas */}
        <section
          className="community-chat-sidebar"
          aria-label="Conversas"
        >
          <div className="community-chat-sidebar-head">
            <h2>Conversas</h2>
            <span>{conversations.length}</span>
          </div>

          <label className="community-chat-search">
            <Search size={16} />

            <span className="feed-sr-only">
              Pesquisar conversas
            </span>

            <input
              placeholder="Buscar conversa"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>

          <div
            className="community-chat-filters"
            role="group"
            aria-label="Filtrar conversas"
          >
            <button
              className={typeFilter === 'all' ? 'active' : ''}
              aria-pressed={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            >
              Todas
            </button>

            <button
              className={typeFilter === 'direct' ? 'active' : ''}
              aria-pressed={typeFilter === 'direct'}
              onClick={() => setTypeFilter('direct')}
            >
              Privadas
            </button>

            <button
              className={typeFilter === 'group' ? 'active' : ''}
              aria-pressed={typeFilter === 'group'}
              onClick={() => setTypeFilter('group')}
            >
              Grupos
            </button>
          </div>

          <div
            className="community-chat-list"
            data-motion-view={typeFilter}
          >
            {loading ? (
              <p className="community-chat-no-results">
                Carregando conversas...
              </p>
            ) : filtered.length > 0 ? (
              filtered.map(chat => (
                <button
                  key={chat.chatid}
                  className={`community-chat-item ${
                    activeChat?.chatid === chat.chatid ? 'active' : ''
                  }`}
                  aria-pressed={activeChat?.chatid === chat.chatid}
                  onClick={() => selectConversation(chat.chatid)}
                >
                  <span className="community-chat-group-icon">
                    <Users size={19} />
                  </span>

                  <span className="community-chat-item-copy">
                    <strong>{chat.chatname}</strong>

                    <small>
                      {chat.chatdescription || 'Conversa sem descrição'}
                    </small>
                  </span>

                  <span className="community-chat-time">
                    {chat.chattypeid === 2 ? 'Grupo' : 'Privado'}
                  </span>
                </button>
              ))
            ) : (
              <p className="community-chat-no-results">
                Nenhuma conversa encontrada.
              </p>
            )}
          </div>

          <p className="community-chat-help">
            Quer conhecer mais pessoas?{' '}
            <Link to="/usuarios">Ver usuários</Link>
          </p>
        </section>

        {/* Área da conversa */}
        <section
          className="community-chat-pane"
          aria-label="Mensagens da conversa ativa"
        >
          {activeChat ? (
            <>
              <header
                key={`header-${activeChat.chatid}`}
                className="community-chat-header"
              >
                <div className="community-chat-heading">
                  <span className="community-chat-heading-icon">
                    <Users size={21} />
                  </span>

                  <div>
                    <h2>{activeChat.chatname}</h2>

                    <p>
                      {activeChat.chatdescription || ' '}
                    </p>
                  </div>
                </div>

                <span className="community-chat-type">
                  {activeChat.chattypeid === 2 ? 'Grupo' : 'Privado'}
                </span>
              </header>

              <div
                key={activeChat.chatid}
                className="community-chat-messages"
              >
                {messagesLoading ? (
                  <p className="community-chat-no-results">
                    Carregando mensagens...
                  </p>
                ) : messages.length > 0 ? (
                  <ol>
                    {messages.map((message, index) => {
                      const previousMessage = messages[index - 1]

                      const showDate =
                        !previousMessage ||
                        new Date(message.sentat).toDateString() !==
                          new Date(previousMessage.sentat).toDateString()

                      const authorName = [
                        message.publicuser.firstname,
                        message.publicuser.lastname,
                      ]
                        .filter(Boolean)
                        .join(' ')

                      const isOwnMessage =
                        message.userid === currentUserId

                      return (
                        <li
                          key={message.messageid}
                          className={`community-chat-message ${
                            isOwnMessage ? 'mine' : 'other'
                          }`}
                        >
                          {showDate && (
                            <div className="community-chat-date">
                              {formatDate(message.sentat)}
                            </div>
                          )}

                          <div className="community-chat-bubble">
                            {activeChat.chattypeid === 2 && (
                              <strong>
                                {authorName || 'Participante'}
                              </strong>
                            )}

                            <p>{message.content}</p>

                            <time dateTime={message.sentat}>
                              {formatTime(message.sentat)}
                            </time>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                ) : (
                  <div className="feed-empty">
                    <MessageCircle size={30} />
                    <p>Esta conversa ainda não possui mensagens.</p>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="community-chat-form"
              >
                <label
                  htmlFor="message-text"
                  className="feed-sr-only"
                >
                  Escrever mensagem para {activeChat.chatname}
                </label>

                <textarea
                  id="message-text"
                  placeholder="Escreva sua mensagem..."
                  rows={2}
                  value={draft}
                  maxLength={2000}
                  onChange={event => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />

                <button
                  className="feed-primary"
                  type="submit"
                  disabled={!draft.trim() || sending}
                  aria-label="Enviar mensagem"
                >
                  <Send size={18} />
                  <span>{sending ? 'Enviando...' : 'Enviar'}</span>
                </button>

                <small>
                  {sending
                    ? 'Enviando mensagem...'
                    : 'Enter envia · Shift + Enter quebra linha'}
                </small>
              </form>
            </>
          ) : (
            <div className="feed-empty">
              <MessageCircle size={30} />

              <p>
                {loading
                  ? 'Carregando conversas...'
                  : 'Escolha uma conversa para começar.'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Retorno para dispositivos móveis */}
      <div className="community-mobile-return">
        <Link to="/usuarios">
          <ArrowLeft size={16} />
          Conhecer mais estudantes
        </Link>

        <span>
          <UserRound size={15} />
          Chats e grupos
        </span>
      </div>
    </CommunityShell>
  )
}

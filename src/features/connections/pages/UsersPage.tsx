
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  Search,
  UserRoundSearch,
  Users,
} from 'lucide-react'

import { CommunityShell } from '../../../components/layout/CommunityShell'
import { ConnectionButton } from '../../demo/ConnectionButton'
import { Avatar } from '../../feed/components/Avatar'

import {
  getAllUsers,
  mapUsersToStudents,
} from '../../../services/feedService'

import {
  createChat,
  findDirectChat,
} from '../../messages/service/chatService'

import type { Student } from '../../feed/types/feed.types'

function getCurrentUserId(): string | null {
  const token = localStorage.getItem('sabires_token')

  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? null
  } catch {
    return null
  }
}

export function UsersPage() {
  const navigate = useNavigate()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [openingChatId, setOpeningChatId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true)
        setError('')

        const response = await getAllUsers()
        const mappedUsers = mapUsersToStudents(response)

        setStudents(mappedUsers)
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        setError('Não foi possível carregar os estudantes.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  async function handleOpenChat(student: Student) {
    try {
      setOpeningChatId(student.id)
      setNotice('')

      const currentUserId = getCurrentUserId()

      if (!currentUserId) {
        setNotice('Sua sessão expirou. Faça login novamente.')
        return
      }

      if (currentUserId === student.id) {
        setNotice('Você não pode iniciar uma conversa consigo mesmo.')
        return
      }

      const existingChat = await findDirectChat(
        currentUserId,
        student.id,
      )

      if (existingChat) {
        navigate(`/mensagens?conversa=${existingChat.chatid}`)
        return
      }

      const newChat = await createChat({
        chattypeid: 1,
        chatname: student.name,
        chatdescription: 'Conversa privada entre estudantes.',
        membersid: [student.id],
      })

      navigate(`/mensagens?conversa=${newChat.chatid}`)
    } catch (error) {
      console.error('Erro ao abrir conversa:', error)
      setNotice('Não foi possível iniciar a conversa. Tente novamente.')
    } finally {
      setOpeningChatId(null)
    }
  }

  const normalized = query.toLocaleLowerCase('pt-BR').trim()

  const users = students.filter(student =>
    student.name.toLocaleLowerCase('pt-BR').includes(normalized),
  )

  return (
    <CommunityShell
      view="users"
      eyebrow="CONEXÕES QUE AMPLIAM HORIZONTES"
      title="Encontre pessoas para aprender junto."
      notice={notice}
      onNotice={setNotice}
      showDemoNotice={false}
    >
      <section
        className="community-stats"
        aria-label="Resumo de usuários"
      >
        <div>
          <Users size={20} />
          <strong>{students.length}</strong>
          <span>estudantes cadastrados</span>
        </div>

        <div>
          <UserRoundSearch size={20} />
          <strong>{users.length}</strong>
          <span>resultados encontrados</span>
        </div>
      </section>

      <section
        className="feed-panel community-search-panel"
        aria-label="Pesquisar usuários"
      >
        <label htmlFor="users-search">
          Pesquisar estudantes
        </label>

        <div className="community-search-box">
          <Search size={19} aria-hidden="true" />

          <input
            id="users-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Digite o nome do estudante"
          />
        </div>
      </section>

      {loading ? (
        <section className="feed-panel feed-empty">
          <p>Carregando estudantes...</p>
        </section>
      ) : error ? (
        <section className="feed-panel feed-empty">
          <p>{error}</p>
        </section>
      ) : users.length ? (
        <div className="community-users-grid">
          {users.map(student => (
            <article
              className="feed-panel community-user-card"
              key={student.id}
            >
              <div className="community-user-heading">
                <Link
                  to={`/profile/${student.id}`}
                  aria-label={`Ver perfil de ${student.name}`}
                >
                  <Avatar student={student} />
                </Link>

                <div>
                  <h2>
                    <Link to={`/profile/${student.id}`}>
                      {student.name}
                    </Link>
                  </h2>

                  <p>
                    {student.followers ?? 0} seguidores
                    {' · '}
                    {student.following ?? 0} seguindo
                  </p>
                </div>
              </div>

              <div className="community-user-actions">
                <ConnectionButton
                  userId={student.id}
                  followerStatusId={student.followerStatusId ?? 0}
                  onNotice={setNotice}
                />

                <button
                  type="button"
                  className="community-outline-link"
                  onClick={() => handleOpenChat(student)}
                  disabled={openingChatId !== null}
                >
                  <MessageCircle size={16} />

                  {openingChatId === student.id
                    ? 'Abrindo...'
                    : 'Mensagem'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="feed-panel feed-empty">
          <UserRoundSearch size={28} />

          <h2>Nenhum usuário encontrado</h2>

          <p>
            Tente pesquisar por outro nome.
          </p>

          <button
            className="feed-primary"
            onClick={() => setQuery('')}
          >
            Limpar pesquisa
          </button>
        </section>
      )}

      <p className="feed-end">
        Os estudantes exibidos são usuários cadastrados no Sabires.
      </p>
    </CommunityShell>
  )
}

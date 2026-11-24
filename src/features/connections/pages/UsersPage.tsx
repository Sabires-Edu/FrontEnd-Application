
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

import type { Student } from '../../feed/types/feed.types'

export function UsersPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [query, setQuery] = useState('')
    const [notice, setNotice] = useState('')

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

    const normalized = query.toLocaleLowerCase('pt-BR').trim()

    const users = students.filter(student =>
        student.name.toLocaleLowerCase('pt-BR').includes(normalized)
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

                                <Link
                                    className="community-outline-link"
                                    to={`/mensagens?conversa=direct-${student.id}`}
                                >
                                    <MessageCircle size={16} />
                                    Mensagem
                                </Link>
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

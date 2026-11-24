
import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    FileText,
    GraduationCap,
    Trash2,
    Home,
    LogOut,
    MessageCircle,
    UserRound,
    Users,
    UserPlus,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyProfile } from '../../profile/services/profileService'
import { getPendingFollows } from '../../../services/followService'
import { Avatar } from './Avatar'

interface Props {
    open: boolean
    collapsed: boolean
    view: 'all' | 'saved' | 'students' | 'profile' | 'users' | 'posts' | 'messages' | 'requests' | 'trash'
    onCollapse: () => void
    onSelect: (view: 'all' | 'saved' | 'students') => void
    onNotice: (message: string) => void
}

type SidebarStudent = Parameters<typeof Avatar>[0]['student']

export function FeedSidebar({
    open,
    collapsed,
    view,
    onCollapse,
    onSelect,
}: Props) {
    const navigate = useNavigate()

    const [authenticatedStudent, setAuthenticatedStudent] =
        useState<SidebarStudent | null>(null)

    const [pendingRequests, setPendingRequests] = useState(0)

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getMyProfile()
                const user = data.response.me

                setAuthenticatedStudent({
                    id: user.userId,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toLocaleUpperCase('pt-BR'),
                    photoUrl: user.profilePicture || undefined,
                    course: '',
                    institution: '',
                    tone: 'teal',
                })
            } catch (error) {
                console.error('Erro ao carregar perfil na barra lateral:', error)
            }
        }

        loadProfile()
    }, [])

    useEffect(() => {
    async function loadPendingRequests() {
        try {
            const response = await getPendingFollows()

            setPendingRequests(response.response.users.length)
        } catch (error) {
            console.error('Erro ao carregar solicitações pendentes:', error)
        }
    }

    loadPendingRequests()

    window.addEventListener(
        'sabires:pending-requests-updated',
        loadPendingRequests
    )

    return () => {
        window.removeEventListener(
            'sabires:pending-requests-updated',
            loadPendingRequests
        )
    }
}, [])

    useEffect(() => {
        async function loadPendingRequests() {
            try {
                const response = await getPendingFollows()

                setPendingRequests(response.response.users.length)
            } catch (error) {
                console.error('Erro ao carregar solicitações pendentes:', error)
            }
        }

        loadPendingRequests()
    }, [])

    function handleLogout() {
        localStorage.removeItem('sabires_token')
        navigate('/login', { replace: true })
    }

    return (
        <aside
            id="feed-navigation"
            className={`feed-sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}
        >
            <div className="feed-mini-profile">
                <Link to="/profile" aria-label="Meu perfil">
                    {authenticatedStudent && (
                        <Avatar student={authenticatedStudent} />
                    )}
                </Link>

                <div className="feed-sidebar-label">
                    <Link to="/profile">
                        <strong>
                            {authenticatedStudent?.name || 'Carregando perfil...'}
                        </strong>
                    </Link>
                </div>
            </div>

            <nav aria-label="Navegação principal">
                <button
                    title="Meu feed"
                    className={view === 'all' ? 'active' : ''}
                    aria-current={view === 'all' ? 'page' : undefined}
                    onClick={() => onSelect('all')}
                >
                    <Home size={20} />
                    <span className="feed-sidebar-label">Meu feed</span>
                </button>

                <Link
                    to="/profile"
                    title="Perfil"
                    className={view === 'profile' ? 'active' : ''}
                    aria-current={view === 'profile' ? 'page' : undefined}
                >
                    <UserRound size={20} />
                    <span className="feed-sidebar-label">Perfil</span>
                </Link>

                <Link
                    to="/usuarios"
                    title="Usuários"
                    className={view === 'users' || view === 'students' ? 'active' : ''}
                    aria-current={
                        view === 'users' || view === 'students' ? 'page' : undefined
                    }
                >
                    <Users size={20} />
                    <span className="feed-sidebar-label">Usuários</span>
                </Link>

                <Link
                    to="/solicitacoes"
                    title="Solicitações"
                    className={view === 'requests' ? 'active' : ''}
                    aria-current={view === 'requests' ? 'page' : undefined}
                >
                    <UserPlus size={20} />
                    <span className="feed-sidebar-label">Solicitações</span>

                    {pendingRequests > 0 && (
                        <span className="requests-count">
                            {pendingRequests}
                        </span>
                    )}
                </Link>

                <Link
                    to="/mensagens"
                    title="Mensagens"
                    className={view === 'messages' ? 'active' : ''}
                    aria-current={view === 'messages' ? 'page' : undefined}
                >
                    <MessageCircle size={20} />
                    <span className="feed-sidebar-label">Mensagens</span>
                </Link>

                <Link
                    to="/postagens"
                    title="Postagens"
                    className={view === 'posts' ? 'active' : ''}
                    aria-current={view === 'posts' ? 'page' : undefined}
                >
                    <FileText size={20} />
                    <span className="feed-sidebar-label">Postagens</span>
                </Link>
                
                <Link
                    to="/lixeira"
                    title="Lixeira"
                    className={view === 'trash' ? 'active' : ''}
                    aria-current={view === 'trash' ? 'page' : undefined}
                >
                    <Trash2 size={20} />
                    <span className="feed-sidebar-label">Lixeira</span>
                </Link>



                <button onClick={handleLogout} title="Sair da conta">
                    <LogOut size={20} />
                    <span className="feed-sidebar-label">Sair</span>
                </button>
            </nav>

            <div className="feed-sidebar-note feed-sidebar-label">
                <GraduationCap size={24} />
                <strong>
                    Conhecimento cresce
                    <br />
                    quando é compartilhado.
                </strong>
                <p>
                    Uma dúvida sua pode começar
                    <br />
                    uma boa conversa.
                </p>
            </div>

            <button
                className="feed-collapse"
                onClick={onCollapse}
                aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
                aria-expanded={!collapsed}
            >
                <ChevronLeft size={18} />
                <span className="feed-sidebar-label">Recolher menu</span>
            </button>

            <p className="feed-sidebar-footer feed-sidebar-label">
                Sabires © 2026
                <br />
                Aprender. Compartilhar. Fazer parte.
            </p>
        </aside>
    )
}


import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Info, X } from 'lucide-react'

import { FeedHeader } from '../../feed/components/FeedHeader'
import { FeedSidebar } from '../../feed/components/FeedSidebar'
import { PostCard } from '../../feed/components/PostCard'

import {
  getFollowers,
  getFollowings,
  
  type FollowUser,
} from '../../../services/followService'

import {
  getFeedPosts,
  getLikedPostIds,
  getUserFeedPosts,
  getUserById,
  likePost,
  unlikePost,
} from '../../../services/feedService'

import { ProfileHeader } from '../components/ProfileHeader'
import { ProfileEditor } from '../components/ProfileEditor'

import {
  getMyProfile,
  updateMyProfile,
  updateProfilePicture,
} from '../services/profileService'

import type {
  OwnProfile,
  Profile,
  ProfileDetails,
} from '../types/profile.types'

import type { FeedPost } from '../../feed/types/feed.types'

import '../../feed/feed.css'
import '../profile.css'

// Converte o código recebido do Back-End no nome da formação.
function getFormationName(statusId: number): string {
  const formations: Record<number, string> = {
    1: 'Ensino Médio',
    2: 'Ensino Superior',
    3: 'Graduado',
    4: 'Professor',
    5: 'Administrador',
    6: 'Outros',
  }

  return formations[statusId] ?? 'Não informado'
}

// Converte o nome da formação para o código esperado pelo Back-End.
function getFormationId(formation: string): number {
  const formations: Record<string, number> = {
    'Ensino Médio': 1,
    'Ensino Superior': 2,
    Graduado: 3,
    Professor: 4,
    Administrador: 5,
    Outros: 6,
  }

  return formations[formation] ?? 6
}

// Gera as iniciais do usuário.
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase('pt-BR')
}

// Converte os dados da API para o formato utilizado pelo perfil.
function mapOwnProfile(
  user: Awaited<ReturnType<typeof getMyProfile>>['response']['me']
): OwnProfile {
  return {
    id: user.userId,
    name: `${user.firstName} ${user.lastName}`.trim(),
    initials: getInitials(user.firstName, user.lastName),
    photoUrl: user.profilePicture ?? undefined,
    course: '',
    institution: '',
    tone: 'teal',

    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    formation: getFormationName(user.statusId),
    birthDate: user.birthDate ?? '',
    biography: user.biography ?? '',
    followers: user.totalFollowers,
    following: user.totalFollowing,
    interests: [],
  }
}

// Converte os dados de outro usuário para o formato do perfil.
function mapPublicProfile(
  user: Awaited<ReturnType<typeof getUserById>>['response']['user']
): Profile {
  return {
    id: user.userid,
    name: `${user.firstname} ${user.lastname}`.trim(),
    initials: getInitials(user.firstname, user.lastname),
    photoUrl: user.profilepicture ?? undefined,
    course: '',
    institution: '',
    tone: 'teal',
    followers: user.followers,
    following: user.following,
    biography: user.biography ?? '',
    interests: [],
  }
}

export function ProfilePage() {
  const { userId } = useParams()

  return <ProfileView key={userId ?? 'me'} userId={userId} />
}

function ProfileView({ userId }: { userId?: string }) {
  const own = !userId

  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [myProfile, setMyProfile] = useState<OwnProfile | null>(null)

  const [posts, setPosts] = useState<FeedPost[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const [tab, setTab] = useState<'posts' | 'about'>('posts')

  const [editing, setEditing] = useState<false | 'details' | 'photo'>(false)

  // Controla a lista de seguidores ou pessoas seguidas.
  const [followListType, setFollowListType] = useState<
    'followers' | 'following' | null
  >(null)

  const [followUsers, setFollowUsers] = useState<FollowUser[]>([])
  const [followLoading, setFollowLoading] = useState(false)
  const [followError, setFollowError] = useState(false)

  const [notice, setNotice] = useState({ text: '', version: 0 })

  // Exibe mensagens na tela.
  function showNotice(text: string) {
    setNotice(previous => ({
      text,
      version: previous.version + 1,
    }))
  }

  // Carrega perfil, publicações e curtidas diretamente da API.
  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError(false)

      try {
        let loadedProfile: Profile
        let loadedOwnProfile: OwnProfile | null = null

        if (own) {
          const result = await getMyProfile()

          // DEBUG: verifica os dados retornados pela API.
          console.log('Dados do meu perfil:', result.response.me)

          loadedOwnProfile = mapOwnProfile(result.response.me)
          loadedProfile = loadedOwnProfile
        } else {
          const result = await getUserById(userId!)

          loadedProfile = mapPublicProfile(result.response.user)
        }

        const [feedPosts, likedPostIds] = await Promise.all([
          own ? getUserFeedPosts() : getFeedPosts(),
          own ? getLikedPostIds() : Promise.resolve([]),
        ])

        if (!active) return

        setProfile(loadedProfile)
        setMyProfile(loadedOwnProfile)
        setPosts(feedPosts)
        setLikedIds(likedPostIds)
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)

        if (!active) return

        setError(true)
        setProfile(null)

        showNotice('Não foi possível carregar os dados do perfil.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [own, userId])

   // Carrega a lista de seguidores ou pessoas que o usuário segue.
  useEffect(() => {
    const profileId = profile?.id

    if (!followListType || !profileId) return

    const userId: string = profileId

    let active = true

    async function loadFollowList() {
      console.log('========== LISTA DE CONEXÕES ==========')
      console.log('Função executada!')
      console.log('Tipo da lista:', followListType)
      console.log('ID do perfil:', userId)

      setFollowLoading(true)
      setFollowError(false)
      setFollowUsers([])

      try {
        const result =
          followListType === 'followers'
            ? await getFollowers(userId)
            : await getFollowings(userId)

        console.log('Resposta completa da API:', result)
        console.log('Total da paginação:', result.response.pagination.total_Elements)
        console.log('Usuários encontrados:', result.response.users)

        if (active) {
          setFollowUsers(result.response.users)
        }
      } catch (error) {
        console.error('Erro ao carregar lista de seguidores:', error)

        if (active) {
          setFollowError(true)
        }
      } finally {
        if (active) {
          setFollowLoading(false)
        }
      }
    }

    loadFollowList()

    return () => {
      active = false
    }
  }, [followListType, profile?.id])
  // Atualiza o título da página.
  useEffect(() => {
    const previous = document.title

    document.title = `${profile?.name ?? 'Perfil'} · Sabires`

    return () => {
      document.title = previous
    }
  }, [profile?.name])

  // Coloca o foco no conteúdo principal.
  useEffect(() => {
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [])

  // Filtra as publicações do usuário atual.
  const studentPosts = posts.filter(
    post => post.author.id === profile?.id
  )

  // Define as abas disponíveis.
  const tabs = [
    { id: 'posts', label: 'Publicações' },
    { id: 'about', label: 'Sobre' },
  ] as const

  function selectTab(id: string) {
    if (id === 'posts' || id === 'about') {
      setTab(id)
    }
  }

  // Fecha a janela de seguidores ou seguindo.
  function closeFollowList() {
    setFollowListType(null)
    setFollowUsers([])
    setFollowError(false)
  }

  // Controla curtidas e descurtidas pela API.
  async function handleLike(postId: string) {
    if (!own) {
      showNotice('Entre na sua conta para curtir publicações.')
      return
    }

    const alreadyLiked = likedIds.includes(postId)

    try {
      if (alreadyLiked) {
        await unlikePost(postId)

        setLikedIds(previous =>
          previous.filter(id => id !== postId)
        )

        setPosts(previous =>
          previous.map(post =>
            post.id === postId
              ? { ...post, likes: Math.max(0, post.likes - 1) }
              : post
          )
        )
      } else {
        await likePost(postId)

        setLikedIds(previous => [...previous, postId])

        setPosts(previous =>
          previous.map(post =>
            post.id === postId
              ? { ...post, likes: post.likes + 1 }
              : post
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar curtida:', error)

      showNotice('Não foi possível atualizar a curtida.')
    }
  }

  // Salva os dados pessoais e a foto de perfil.
  async function handleSaveProfile(
    details: ProfileDetails,
    photo?: File
  ) {
    if (!myProfile) return

    try {
      const changes: {
        firstname?: string
        lastname?: string
        statusid?: number
        biography?: string
        birthdate?: string
      } = {}

      if (details.firstName !== myProfile.firstName) {
        changes.firstname = details.firstName
      }

      if (details.lastName !== myProfile.lastName) {
        changes.lastname = details.lastName
      }

      if (details.formation !== myProfile.formation) {
        changes.statusid = getFormationId(details.formation)
      }

      if (details.biography !== myProfile.biography) {
        changes.biography = details.biography
      }

      if (details.birthDate !== myProfile.birthDate) {
        changes.birthdate = details.birthDate
      }

      const hasChanges = Object.keys(changes).length > 0

      if (!hasChanges && !photo) {
        showNotice('Nenhuma alteração para salvar.')
        return
      }

      // Atualiza os dados pessoais.
      if (hasChanges) {
        await updateMyProfile(changes)
      }

      // Envia a foto selecionada para o servidor.
      if (photo) {
        await updateProfilePicture(photo)
      }

      // Busca novamente os dados atualizados no servidor.
      const result = await getMyProfile()

      const updatedProfile = mapOwnProfile(result.response.me)

      setMyProfile(updatedProfile)
      setProfile(updatedProfile)
      setEditing(false)

      showNotice('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)

      showNotice('Não foi possível atualizar o perfil.')
    }
  }

  return (
    <div className="sabires-feed sabires-profile">

      <a className="feed-skip-link" href="#profile-main">
        Pular para o perfil
      </a>

      <FeedHeader
        view="profile"
        onHome={() => navigate('/feed')}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen(!menuOpen)}
        onNotice={showNotice}
        onStudents={() => navigate('/feed?view=students')}
      />

      <div
        className={`feed-layout profile-layout ${
          collapsed ? 'feed-layout--collapsed' : ''
        }`}
      >
        <FeedSidebar
          view="profile"
          open={menuOpen}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          onSelect={view =>
            navigate(view === 'all' ? '/feed' : `/feed?view=${view}`)
          }
          onNotice={showNotice}
        />

        <main
          id="profile-main"
          ref={mainRef}
          tabIndex={-1}
          className="feed-main"
        >
          <Link to="/feed" className="profile-back">
            <ArrowLeft size={16} />
            Voltar ao feed
          </Link>

          {loading ? (
            <section className="feed-panel feed-empty">
              <p>Carregando perfil...</p>
            </section>
          ) : error || !profile ? (
            <section className="feed-panel feed-empty">
              <BookOpen size={30} />

              <h1>Não foi possível carregar o perfil</h1>

              <p>
                Verifique sua conexão e tente novamente.
              </p>

              <Link to="/feed" className="feed-primary">
                Voltar ao feed
              </Link>
            </section>
          ) : (
            <>
              <ProfileHeader
                profile={profile}
                own={own}
                onEdit={photo =>
                  setEditing(photo ? 'photo' : 'details')
                }
                onOpenFollowList={type => setFollowListType(type)}
              />

              <div
                className="profile-tabs"
                role="tablist"
                aria-label="Seções do perfil"
                onKeyDown={event => {
                  if (
                    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                      event.key
                    )
                  ) {
                    return
                  }

                  event.preventDefault()

                  const index = tabs.findIndex(
                    item => item.id === tab
                  )

                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? tabs.length - 1
                        : (
                            index +
                            (event.key === 'ArrowRight' ? 1 : -1) +
                            tabs.length
                          ) % tabs.length

                  selectTab(tabs[next].id)

                  document
                    .getElementById(`profile-tab-${tabs[next].id}`)
                    ?.focus()
                }}
              >
                {tabs.map(item => (
                  <button
                    key={item.id}
                    role="tab"
                    id={`profile-tab-${item.id}`}
                    aria-selected={tab === item.id}
                    aria-controls="profile-tabpanel"
                    tabIndex={tab === item.id ? 0 : -1}
                    onClick={() => selectTab(item.id)}
                  >
                    {item.label}

                    {item.id === 'posts' && (
                      <span>{studentPosts.length}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="profile-columns">
                <section
                  id="profile-tabpanel"
                  role="tabpanel"
                  aria-labelledby={`profile-tab-${tab}`}
                  tabIndex={0}
                >
                  {tab === 'posts' && (
                    <>
                      {studentPosts.length ? (
                        <div className="feed-post-list">
                          {studentPosts.map(post => (
                            <PostCard
                              key={post.id}
                              post={post}
                              liked={likedIds.includes(post.id)}
                              onLike={() => handleLike(post.id)}
                              onNotice={showNotice}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="feed-panel feed-empty">
                          <BookOpen size={28} />

                          <h2>
                            {own
                              ? 'Sua primeira conversa começa aqui'
                              : 'Ainda não há publicações'}
                          </h2>

                          <p>
                            {own
                              ? 'Compartilhe uma descoberta no feed. Suas publicações aparecerão aqui.'
                              : 'Este estudante ainda não possui publicações.'}
                          </p>

                          {own && (
                            <Link to="/feed" className="feed-primary">
                              Compartilhar no feed
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {tab === 'about' && (
                    <section className="feed-panel profile-about">
                      <h2>
                        Sobre {own ? 'você' : profile.name.split(' ')[0]}
                      </h2>

                      <p className="profile-bio">
                        {profile.biography ||
                          'Nenhuma biografia preenchida.'}
                      </p>

                      {own && myProfile && (
                        <div className="profile-academic">
                          <h3>Formação acadêmica</h3>
                          <p>{myProfile.formation}</p>
                        </div>
                      )}
                    </section>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal de seguidores e pessoas seguidas */}
      {followListType && (
        <div
          className="follow-modal-overlay"
          onClick={closeFollowList}
        >
          <section
            className="follow-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="follow-modal-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="follow-modal-header">
              <h2 id="follow-modal-title">
                {followListType === 'followers'
                  ? 'Seguidores'
                  : 'Seguindo'}
              </h2>

              <button
                type="button"
                className="follow-modal-close"
                aria-label="Fechar janela"
                onClick={closeFollowList}
              >
                <X size={20} />
              </button>
            </div>

            <div className="follow-modal-content">
              {followLoading ? (
                <p className="follow-modal-message">
                  Carregando usuários...
                </p>
              ) : followError ? (
                <p className="follow-modal-message">
                  Não foi possível carregar a lista. Tente novamente.
                </p>
              ) : followUsers.length === 0 ? (
                <p className="follow-modal-message">
                  {followListType === 'followers'
                    ? 'Este estudante ainda não possui seguidores.'
                    : 'Este estudante ainda não está seguindo ninguém.'}
                </p>
              ) : (
                <div className="follow-user-list">
                  {followUsers.map(user => {
                    const fullName =
                      `${user.firstname} ${user.lastname}`.trim()

                    const initials = getInitials(
                      user.firstname,
                      user.lastname
                    )

                    return (
                      <Link
                        key={user.userid}
                        to={`/profile/${user.userid}`}
                        className="follow-user-item"
                        onClick={closeFollowList}
                      >
                        {user.profilepicture ? (
                          <img
                            src={user.profilepicture}
                            alt={`Foto de ${fullName}`}
                            className="follow-user-avatar"
                          />
                        ) : (
                          <span className="follow-user-avatar follow-user-initials">
                            {initials}
                          </span>
                        )}

                        <span className="follow-user-name">
                          {fullName}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <div
        className="feed-toast-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice.text && (
          <div key={notice.version} className="feed-toast">
            <Info size={20} />

            <p>{notice.text}</p>

            <button
              className="feed-icon-button"
              aria-label="Fechar aviso"
              onClick={() => showNotice('')}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {own && editing && myProfile && (
        <ProfileEditor
          profile={myProfile}
          focusPhoto={editing === 'photo'}
          onCancel={() => setEditing(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}

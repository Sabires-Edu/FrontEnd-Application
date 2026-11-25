
import { useEffect, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { FeedHeader } from '../components/FeedHeader'
import { FeedSidebar } from '../components/FeedSidebar'
import { PostComposer } from '../components/PostComposer'
import { SuggestedStudents } from '../components/SuggestedStudents'
import { FeedContent } from '../components/FeedContent'

import type {
  FeedPost,
  FeedViewState,
} from '../types/feed.types'

import {
  getFeedPosts,
  getLikedPostIds,
  likePost,
  unlikePost,
  createFeedPost,
} from '../../../services/feedService'

import '../feed.css'

export function FeedPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [view, setView] = useState<'all' | 'saved' | 'students'>(() =>
    params.get('view') === 'students' ? 'students' : 'all'
  )

  // Estados das publicações vindas da API.
  const [apiPosts, setApiPosts] = useState<FeedPost[]>([])
  const [feedState, setFeedState] = useState<FeedViewState>('loading')
  const [likedIds, setLikedIds] = useState<string[]>([])

  const [notice, setNotice] = useState('')
  const [noticeVersion, setNoticeVersion] = useState(0)

  const mainRef = useRef<HTMLElement>(null)
  const [composeRequested, setComposeRequested] = useState(false)

  // Busca as publicações da API.
  useEffect(() => {
    let active = true

    async function loadFeed() {
      try {
        setFeedState('loading')

        const data = await getFeedPosts()

        if (active) {
          setApiPosts(data)
          setFeedState('ready')
        }
      } catch (error) {
        console.error('Erro ao carregar o Feed:', error)

        if (active) {
          setFeedState('error')
        }
      }
    }

    loadFeed()

    return () => {
      active = false
    }
  }, [])

  // Busca as curtidas do usuário.
  useEffect(() => {
    let active = true

    async function loadLikedPosts() {
      try {
        const ids = await getLikedPostIds()

        if (active) {
          setLikedIds(ids)
        }
      } catch (error) {
        console.error('Erro ao carregar curtidas:', error)
      }
    }

    loadLikedPosts()

    return () => {
      active = false
    }
  }, [])

  // Gerencia o foco do campo de publicação.
  useEffect(() => {
    if (composeRequested) {
      mainRef.current
        ?.querySelector<HTMLTextAreaElement>('#feed-composer textarea')
        ?.focus()
    }
  }, [composeRequested])

  // Atualiza o título da página.
  useEffect(() => {
    const previous = document.title
    document.title = 'Meu feed · Sabires'

    return () => {
      document.title = previous
    }
  }, [])

  // Exibe avisos na tela.
  function showNotice(message: string) {
    setNotice(message)
    setNoticeVersion(previous => previous + 1)
  }

  // Seleciona a visualização do Feed.
  function selectView(next: typeof view) {
    setComposeRequested(false)

    // Favoritos ainda não possuem integração com a API.
    setView(next === 'saved' ? 'all' : next)

    setMenuOpen(false)
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
  }

  // Inicia uma conversa.
  function startConversation() {
    setView('all')
    setComposeRequested(true)

    mainRef.current
      ?.querySelector<HTMLTextAreaElement>('#feed-composer textarea')
      ?.focus()
  }

  // Curte ou remove a curtida de uma publicação.
  async function toggleLike(id: string) {
    const alreadyLiked = likedIds.includes(id)

    try {
      if (alreadyLiked) {
        await unlikePost(id)

        setLikedIds(previous =>
          previous.filter(postId => postId !== id)
        )

        setApiPosts(previous =>
          previous.map(post =>
            post.id === id
              ? { ...post, likes: Math.max(0, post.likes - 1) }
              : post
          )
        )

        showNotice('Curtida removida com sucesso.')
      } else {
        await likePost(id)

        setLikedIds(previous => [...previous, id])

        setApiPosts(previous =>
          previous.map(post =>
            post.id === id
              ? { ...post, likes: post.likes + 1 }
              : post
          )
        )

        showNotice('Publicação curtida com sucesso.')
      }
    } catch (error) {
      console.error('Erro ao atualizar curtida:', error)

      showNotice(
        'Não foi possível atualizar a curtida. Tente novamente.'
      )
    }
  }

  // Publica uma postagem na API.
  async function publishPost(
    content: string,
    images: File[],
  ): Promise<boolean> {
    if (!content.trim() && images.length === 0) return false

    try {
      await createFeedPost(content.trim(), images)

      const updatedPosts = await getFeedPosts()
      setApiPosts(updatedPosts)

      selectView('all')
      showNotice('Publicação criada com sucesso!')

      return true
    } catch (error) {
      console.error('Erro ao criar publicação:', error)

      showNotice(
        'Não foi possível criar a publicação. Tente novamente.'
      )

      return false
    }
  }

  return (
    <div
      className="sabires-feed"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          setMenuOpen(false)
          setNotice('')
        }
      }}
    >
      <a className="feed-skip-link" href="#feed-main">
        Pular para o conteúdo
      </a>

      <FeedHeader
        view={view}
        onHome={() => selectView('all')}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen(!menuOpen)}
        onNotice={showNotice}
        onStudents={() => navigate('/usuarios')}
      />

      <div
        className={`feed-layout ${collapsed ? 'feed-layout--collapsed' : ''}`}
      >
        <FeedSidebar
          open={menuOpen}
          collapsed={collapsed}
          view={view}
          onCollapse={() => setCollapsed(!collapsed)}
          onSelect={selectView}
          onNotice={showNotice}
        />

        <main
          id="feed-main"
          ref={mainRef}
          tabIndex={-1}
          className="feed-main"
        >
          <div className="feed-page-heading">
            <div>
              <p className="feed-eyebrow">
                SUA COMUNIDADE DE APRENDIZADO
              </p>

              <h1>
                {view === 'students'
                  ? 'Encontre sua turma'
                  : 'Boas ideias se encontram aqui.'}
              </h1>
            </div>

            <span className="feed-heading-mark" aria-hidden="true">
              ✳
            </span>
          </div>

          <div
            id="feed-composer"
            hidden={view === 'students'}
          >
            <PostComposer onPublish={publishPost} />
          </div>

          {view === 'students' ? (
            <SuggestedStudents
              onNotice={showNotice}
              onCompose={startConversation}
            />
          ) : (
            <>
              <div className="feed-filter-bar">
                <div>
                  <button
                    className="active"
                    aria-pressed="true"
                  >
                    Para você
                  </button>
                </div>
              </div>

              <FeedContent
                view="all"
                state={feedState}
                posts={apiPosts}
                likedIds={likedIds}
                onLike={toggleLike}
                savedIds={[]}
                onSave={() => {}}
                onNotice={showNotice}
                onReset={() => selectView('all')}
              />

              <p className="feed-end">
                Você chegou ao fim desta seleção.
                <br />
                <span>Uma nova conversa pode começar com você.</span>
              </p>
            </>
          )}
        </main>
      </div>

      <div
        className="feed-toast-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <div
            key={noticeVersion}
            className="feed-toast"
          >
            <Info size={20} />

            <p>{notice}</p>

            <button
              className="feed-icon-button"
              aria-label="Fechar aviso"
              onClick={() => setNotice('')}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

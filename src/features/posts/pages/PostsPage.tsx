
  import { useEffect, useState } from 'react'
  import { FileText, PenLine } from 'lucide-react'

  import { CommunityShell } from '../../../components/layout/CommunityShell'
  import { PostCard } from '../../feed/components/PostCard'
  import { PostComposer } from '../../feed/components/PostComposer'

  import {
    getFeedPosts,
    getUserPosts,
    getLikedPostIds,
    likePost,
    unlikePost,
    createFeedPost,
    insertPostTrash,
  } from '../../../services/feedService'

  import type { FeedPost } from '../../feed/types/feed.types'

  type Filter = 'all' | 'mine'

  export function PostsPage() {
    const [filter, setFilter] = useState<Filter>('all')
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [likedIds, setLikedIds] = useState<string[]>([])
    const [myPostIds, setMyPostIds] = useState<string[]>([])
    const [notice, setNotice] = useState('')
    const [loading, setLoading] = useState(true)

    // Carrega as postagens e as curtidas do usuário.
    async function loadPosts() {
      try {
        setLoading(true)

        const [allPosts, likedPostIds, userPostsResult] = await Promise.all([
          getFeedPosts(),
          getLikedPostIds(),
          getUserPosts(),
        ])

        setPosts(allPosts)
        setLikedIds(likedPostIds)

        const userIds = userPostsResult.response.posts.map(post =>
          String(post.postId)
        )

        setMyPostIds(userIds)

        // Verifica os IDs das publicações do usuário e do feed.
        console.log('IDs das minhas publicações:', userIds)

        console.log(
          'Publicações carregadas:',
          allPosts.map(post => ({
            id: post.id,
            autor: post.author.name,
          }))
        )
      } catch (error) {
        console.error('Erro ao carregar postagens:', error)
        setNotice('Não foi possível carregar as postagens.')
      } finally {
        setLoading(false)
      }
    }

    // Carrega as postagens ao abrir a página.
    useEffect(() => {
      loadPosts()
    }, [])

    // Publica uma postagem na API.
    async function publish(
      content: string,
      images: File[],
    ): Promise<boolean> {
      try {
        await createFeedPost(content, images)

        await loadPosts()

        setFilter('all')
        setNotice('Sua publicação foi enviada com sucesso!')

        return true
      } catch (error) {
        console.error('Erro ao publicar:', error)
        setNotice('Não foi possível publicar. Tente novamente.')

        return false
      }
    }

    // Carrega somente as postagens do usuário autenticado.
    async function loadMyPosts() {
      try {
        setLoading(true)

        const [result, likedPostIds] = await Promise.all([
          getUserPosts(),
          getLikedPostIds(),
        ])

        const userPosts = result.response.posts

        const allPosts = await getFeedPosts()
        const myIds = new Set(userPosts.map(post => String(post.postId)))

        setPosts(allPosts.filter(post => myIds.has(post.id)))
        setLikedIds(likedPostIds)
      } catch (error) {
        console.error('Erro ao carregar suas postagens:', error)
        setNotice('Não foi possível carregar suas postagens.')
      } finally {
        setLoading(false)
      }
    }

    // Atualiza a lista conforme o filtro selecionado.
    async function handleFilterChange(nextFilter: Filter) {
      setFilter(nextFilter)

      if (nextFilter === 'mine') {
        await loadMyPosts()
      } else {
        await loadPosts()
      }
    }

    // Registra ou remove uma curtida na API.
    async function handleLike(postId: string) {
      const alreadyLiked = likedIds.includes(postId)

      try {
        if (alreadyLiked) {
          await unlikePost(postId)
          setLikedIds(current => current.filter(id => id !== postId))
        } else {
          await likePost(postId)
          setLikedIds(current => [...current, postId])
        }
      } catch (error) {
        console.error('Erro ao atualizar curtida:', error)
        setNotice('Não foi possível atualizar a curtida.')
      }
    }

    // Move uma publicação para a lixeira.
    async function handleMoveToTrash(postId: string) {
    try {
        await insertPostTrash(Number(postId))

        setPosts(current =>
            current.filter(post => post.id !== postId)
        )

        setMyPostIds(current =>
            current.filter(id => id !== postId)
        )

        setNotice('Postagem movida para a lixeira com sucesso!')
    } catch (error) {
        console.error('Erro ao mover postagem para a lixeira:', error)

        setNotice('Não foi possível mover a postagem para a lixeira.')
    }
}

    return (
      <CommunityShell
        view="posts"
        eyebrow="COMPARTILHE O QUE VOCÊ APRENDE"
        title="Postagens da comunidade."
        notice={notice}
        onNotice={setNotice}
        showDemoNotice={false}
      >
        <section className="community-intro feed-panel">
          <PenLine size={22} />

          <div>
            <h2>Compartilhe uma descoberta</h2>
            <p>
              Uma pergunta, uma ideia ou um projeto podem iniciar
              uma ótima conversa.
            </p>
          </div>
        </section>

        <PostComposer onPublish={publish} />

        <div
          className="community-tabs"
          role="group"
          aria-label="Filtrar postagens"
        >
          <button
            className={filter === 'all' ? 'active' : ''}
            aria-pressed={filter === 'all'}
            onClick={() => handleFilterChange('all')}
          >
            Todas
          </button>

          <button
            className={filter === 'mine' ? 'active' : ''}
            aria-pressed={filter === 'mine'}
            onClick={() => handleFilterChange('mine')}
          >
            Minhas postagens
          </button>
        </div>

        {loading ? (
          <p className="feed-muted">Carregando postagens...</p>
        ) : posts.length > 0 ? (
          <div className="feed-post-list" data-motion-view={filter}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                liked={likedIds.includes(post.id)}
                saved={false}
                onLike={() => handleLike(post.id)}
                onSave={() => {}}
                onMoveToTrash={
                  myPostIds.includes(post.id)
                    ? () => handleMoveToTrash(post.id)
                    : undefined
                }
                onNotice={setNotice}
              />
            ))}
          </div>
        ) : (
          <section className="feed-panel feed-empty">
            <FileText size={28} />

            <h2>
              {filter === 'mine'
                ? 'Você ainda não publicou'
                : 'Nenhuma postagem por aqui'}
            </h2>

            <p>
              {filter === 'mine'
                ? 'Use o campo acima para criar sua primeira publicação.'
                : 'Volte mais tarde para explorar as publicações da comunidade.'}
            </p>

            {filter === 'mine' && (
              <button
                className="feed-primary"
                onClick={() => handleFilterChange('all')}
              >
                Ver todas
              </button>
            )}
          </section>
        )}

        <p className="feed-end">
          As publicações são carregadas diretamente do servidor do Sabires.
        </p>
      </CommunityShell>
    )
  }

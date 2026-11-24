
import { useEffect, useState } from 'react'

import { CommunityShell } from '../../../components/layout/CommunityShell'
import { PostCard } from '../../feed/components/PostCard'

import type { FeedPost } from '../../feed/types/feed.types'

import {
    getTrashFeedPosts,
    restoreTrashPost,
    removeTrashPost,
} from '../../../services/feedService'

export function TrashPage() {
    const [notice, setNotice] = useState('')
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loading, setLoading] = useState(true)

    // Carrega as postagens da lixeira
    useEffect(() => {
        async function loadTrashPosts() {
            try {
                setLoading(true)

                const data = await getTrashFeedPosts()

                setPosts(data)
            } catch (error) {
                console.error('Erro ao carregar a lixeira:', error)

                setNotice(
                    'Não foi possível carregar as postagens da lixeira.'
                )
            } finally {
                setLoading(false)
            }
        }

        loadTrashPosts()
    }, [])

    // Restaura uma postagem
    async function handleRestore(postId: string) {
        try {
            await restoreTrashPost(Number(postId))

            setPosts(current =>
                current.filter(post => post.id !== postId)
            )

            setNotice('Postagem restaurada com sucesso!')
        } catch (error) {
            console.error('Erro ao restaurar postagem:', error)

            setNotice('Não foi possível restaurar a postagem.')
        }
    }

    // Exclui uma postagem permanentemente
    async function handlePermanentDelete(postId: string) {
        try {
            await removeTrashPost(Number(postId))

            setPosts(current =>
                current.filter(post => post.id !== postId)
            )

            setNotice('Postagem excluída permanentemente!')
        } catch (error) {
            console.error('Erro ao excluir postagem:', error)

            setNotice('Não foi possível excluir a postagem.')
        }
    }

    return (
        <CommunityShell
            view="trash"
            eyebrow="GERENCIAMENTO DE CONTEÚDO"
            title="Lixeira."
            notice={notice}
            onNotice={setNotice}
            showDemoNotice={false}
        >
            <section className="trash-page">

                {/* Carregamento */}
                {loading && (
                    <p>Carregando postagens...</p>
                )}

                {/* Lixeira vazia */}
                {!loading && posts.length === 0 && (
                    <div className="trash-empty">
                        <p>A lixeira está vazia.</p>
                    </div>
                )}

                {/* Lista de postagens */}
                {!loading && posts.length > 0 && (
                    <div className="feed-post-list">

                        {posts.map(post => (
                            <div
                                key={post.id}
                                className="trash-post-item"
                            >
                                <PostCard
                                    post={post}
                                    liked={false}
                                    saved={false}
                                    onLike={() =>
                                        setNotice(
                                            'Não é possível curtir uma postagem na lixeira.'
                                        )
                                    }
                                    onSave={() => {}}
                                    onNotice={setNotice}
                                />

                                {/* Ações da postagem */}
                                <div className="trash-post-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRestore(post.id)
                                        }
                                    >
                                        Restaurar postagem
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePermanentDelete(post.id)
                                        }
                                    >
                                        Excluir permanentemente
                                    </button>

                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </section>
        </CommunityShell>
    )
}

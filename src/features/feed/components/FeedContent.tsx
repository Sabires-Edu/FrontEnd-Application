import { Bookmark, CircleAlert, LoaderCircle } from 'lucide-react'
import type { FeedPost, FeedViewState } from '../types/feed.types'
import { PostCard } from './PostCard'

interface Props { view: 'all' | 'saved'; state: FeedViewState; posts: FeedPost[]; savedIds: string[]; likedIds: string[]; onLike: (id: string) => void; onSave: (id: string) => void; onNotice: (message: string) => void; onReset: () => void }
export function FeedContent({ view, state, posts, savedIds, likedIds, onLike, onSave, onNotice, onReset }: Props) {
  if (state === 'loading') return <div data-motion-view={view} className="feed-panel feed-empty" role="status"><LoaderCircle size={28} /><h2>Carregando publicações</h2><p>Estamos preparando seu feed.</p></div>
  if (state === 'error') return <div data-motion-view={view} className="feed-panel feed-empty" role="alert"><CircleAlert size={28} /><h2>Não foi possível carregar o feed</h2><p>Tente novamente mais tarde.</p></div>
  if (!posts.length) return <div data-motion-view={view} className="feed-panel feed-empty"><Bookmark size={28} /><h2>Nenhuma publicação por aqui</h2><p>Salve uma publicação para encontrá-la aqui durante esta sessão.</p><button className="feed-primary" onClick={onReset}>Explorar o feed</button></div>
  return <div data-motion-view={view} className="feed-post-list">{posts.map(post => <PostCard key={post.id} post={post} liked={likedIds.includes(post.id)} onLike={() => onLike(post.id)} saved={savedIds.includes(post.id)} onSave={() => onSave(post.id)} onNotice={onNotice} />)}</div>
}


import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Paperclip,
  Trash2,
  X,
} from 'lucide-react'

import type { FeedPost } from '../types/feed.types'
import { Avatar } from './Avatar'
import { CommentThread } from './CommentThread'
import { getFeedComments } from '../../../services/feedService'

interface Props {
  post: FeedPost
  liked: boolean
  onLike: () => void
  onNotice: (message: string) => void
  onMoveToTrash?: () => void

  // Mantidos temporariamente para compatibilidade com o FeedPage.
  saved?: boolean
  onSave?: () => void
}

export function PostCard({
  post,
  liked,
  onLike,
  onNotice,
  onMoveToTrash,
}: Props) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const selectedImage =
    selectedImageIndex !== null
      ? post.imageUrls?.[selectedImageIndex]
      : null

  function showNextImage() {
    if (!post.imageUrls || selectedImageIndex === null) return

    setSelectedImageIndex(
      (selectedImageIndex + 1) % post.imageUrls.length,
    )
  }

  function showPreviousImage() {
    if (!post.imageUrls || selectedImageIndex === null) return

    setSelectedImageIndex(
      (selectedImageIndex - 1 + post.imageUrls.length) %
        post.imageUrls.length,
    )
  }

  // Fecha a visualização da imagem ao pressionar Escape.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedImageIndex(null)
      }
    }

    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImageIndex])

  // Estados dos comentários.
  const [comments, setComments] = useState(post.comments)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentsError, setCommentsError] = useState(false)

  // Atualiza os comentários da publicação.
  async function refreshComments() {
    const result = await getFeedComments(Number(post.id))

    setComments(result)
    setCommentsLoaded(true)
  }

  // Consulta os comentários da publicação.
  async function handleCommentsToggle() {
    if (commentsOpen) {
      setCommentsOpen(false)
      return
    }

    setCommentsOpen(true)

    if (commentsLoaded) return

    try {
      setCommentsLoading(true)
      setCommentsError(false)

      await refreshComments()
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      setCommentsError(true)
    } finally {
      setCommentsLoading(false)
    }
  }

  return (
    <article
      className="feed-panel feed-post"
      aria-labelledby={`${post.id}-author`}
    >
      <div className="feed-post-header">
        <Link
          to={`/profile/${post.author.id}`}
          aria-label={`Ver perfil de ${post.author.name}`}
        >
          <Avatar student={post.author} />
        </Link>

        <div className="feed-author">
          <h2 id={`${post.id}-author`}>
            <Link to={`/profile/${post.author.id}`}>
              {post.author.name}
            </Link>
          </h2>

          <p>
            {post.author.course} · {post.author.institution}
          </p>

          <span>{post.timeLabel}</span>
        </div>
      </div>

      {post.text && (
        <p className="feed-post-text">{post.text}</p>
      )}

      {/* Imagens da publicação. */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div
          className={`feed-post-images feed-post-images--${Math.min(post.imageUrls.length, 4)}`}
        >
          {post.imageUrls.map((imageUrl, index) => (
            <button
              key={`${post.id}-image-${index}`}
              type="button"
              className="feed-image-button"
              onClick={() => setSelectedImageIndex(index)}
              aria-label={`Ampliar imagem ${index + 1}`}
            >
              <img
                src={imageUrl}
                alt={`Imagem ${index + 1} da publicação`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {!!post.attachments?.length && (
        <div className="feed-post-attachments">
          <ul>
            {post.attachments.map((attachment, index) => (
              <li key={`${attachment.name}-${index}`}>
                <Paperclip size={16} aria-hidden="true" />

                <span>{attachment.name}</span>

                <small>
                  {new Intl.NumberFormat('pt-BR', {
                    maximumFractionDigits: 1,
                  }).format(attachment.size / 1024)} KB
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {post.resource && (
        <div className="feed-resource">
          <div className="feed-resource-art" aria-hidden="true">
            <BookOpen size={34} />
          </div>

          <div className="feed-resource-copy">
            <span>{post.resource.label}</span>
            <strong>{post.resource.title}</strong>
            <p>{post.resource.description}</p>
          </div>
        </div>
      )}

      <div className="feed-post-meta">
        <span className="feed-topic">{post.topic}</span>

        <span>
          <Heart size={13} />
          {post.likes}
          <span className="feed-meta-separator">·</span>
          {post.commentsCount ?? comments.length} comentários
        </span>
      </div>

      <div className="feed-post-actions">
        <button
          aria-pressed={liked}
          title={liked ? 'Remover curtida' : 'Curtir publicação'}
          className={liked ? 'is-selected' : ''}
          onClick={onLike}
        >
          <Heart
            size={19}
            fill={liked ? 'currentColor' : 'none'}
          />
          <span>{liked ? 'Curtiu' : 'Curtir'}</span>
        </button>

        <button
          aria-expanded={commentsOpen}
          aria-controls={`${post.id}-comments`}
          onClick={handleCommentsToggle}
        >
          <MessageCircle size={19} />
          <span>Comentar</span>
        </button>

          {onMoveToTrash && (
        <button
          type="button"
          onClick={onMoveToTrash}
          title="Mover para lixeira"
        >
          <Trash2 size={19} />
          <span>Mover para lixeira</span>
        </button>
      )}
      </div>

      {/* Área dos comentários. */}
      <div
        id={`${post.id}-comments`}
        hidden={!commentsOpen}
      >
        {commentsLoading && (
          <p className="feed-muted">
            Carregando comentários...
          </p>
        )}

        {commentsError && (
          <p className="feed-muted">
            Não foi possível carregar os comentários.
            Feche e abra novamente para tentar.
          </p>
        )}

        {!commentsLoading && !commentsError && (
          <CommentThread
            comments={comments}
            rootPostId={Number(post.id)}
            onNotice={onNotice}
            onCommentCreated={refreshComments}
          />
        )}
      </div>

      {/* Visualização ampliada das imagens. */}
      {selectedImage && (
        <div
          className="feed-image-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da imagem"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            type="button"
            className="feed-image-modal-close"
            onClick={() => setSelectedImageIndex(null)}
            aria-label="Fechar imagem"
          >
            <X size={24} />
          </button>

          {post.imageUrls && post.imageUrls.length > 1 && (
            <>
              <button
                type="button"
                className="feed-image-modal-nav feed-image-modal-prev"
                onClick={showPreviousImage}
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={32} />
              </button>

              <button
                type="button"
                className="feed-image-modal-nav feed-image-modal-next"
                onClick={showNextImage}
                aria-label="Próxima imagem"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <img
            src={selectedImage}
            alt="Imagem ampliada da publicação"
            onClick={event => event.stopPropagation()}
          />
        </div>
      )}
    </article>
  )
}

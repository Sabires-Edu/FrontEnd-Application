
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { FeedComment } from '../types/feed.types'
import { Avatar } from './Avatar'
import { createFeedComment } from '../../../services/feedService'

function Comment({
  comment,
  rootPostId,
  onNotice,
  onCommentCreated,
}: {
  comment: FeedComment
  rootPostId: number
  onNotice: (message: string) => void
  onCommentCreated: () => Promise<void>
}) {
  const [replying, setReplying] = useState(false)

  return (
    <li className="feed-comment">
      <div className="feed-comment-row">
        <Link
          to={`/profile/${comment.author.id}`}
          aria-label={`Ver perfil de ${comment.author.name}`}
        >
          <Avatar student={comment.author} small />
        </Link>

        <div>
          <Link to={`/profile/${comment.author.id}`}>
            <strong>{comment.author.name}</strong>
          </Link>

          <p>{comment.text}</p>

          <button
            className="feed-text-button"
            aria-expanded={replying}
            onClick={() => setReplying(!replying)}
          >
            Responder
          </button>
        </div>
      </div>

      {replying && (
        <CommentDraft
          label={`Responder a ${comment.author.name}`}
          rootPostId={rootPostId}
          parentPostId={Number(comment.id)}
          onNotice={onNotice}
          onCommentCreated={onCommentCreated}
        />
      )}

      {comment.replies && (
        <ul className="feed-replies">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              rootPostId={rootPostId}
              onNotice={onNotice}
              onCommentCreated={onCommentCreated}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function CommentDraft({
  label,
  rootPostId,
  parentPostId,
  onNotice,
  onCommentCreated,
}: {
  label: string
  rootPostId: number
  parentPostId?: number
  onNotice: (message: string) => void
  onCommentCreated: () => Promise<void>
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!text.trim() || loading) return

    try {
      setLoading(true)

      await createFeedComment(
        text.trim(),
        rootPostId,
        parentPostId ?? rootPostId,
      )

      setText('')
      await onCommentCreated()

      onNotice('Comentário enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
      onNotice('Não foi possível enviar o comentário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="feed-comment-form" onSubmit={handleSubmit}>
      <label>
        {label}

        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          maxLength={1500}
          rows={2}
          placeholder="Acrescente uma ideia à conversa…"
        />
      </label>

      <div>
        <small>
          {loading ? 'Enviando...' : 'Máximo de 1500 caracteres'}
        </small>

        <button
          className="feed-comment-submit"
          disabled={!text.trim() || loading}
          type="submit"
        >
          {loading ? 'Enviando...' : 'Enviar comentário'}
        </button>
      </div>
    </form>
  )
}

export function CommentThread({
  comments,
  rootPostId,
  onNotice,
  onCommentCreated,
}: {
  comments: FeedComment[]
  rootPostId: number
  onNotice: (message: string) => void
  onCommentCreated: () => Promise<void>
}) {
  return (
    <section className="feed-comments" aria-label="Comentários">
      {comments.length ? (
        <ul>
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              rootPostId={rootPostId}
              onNotice={onNotice}
              onCommentCreated={onCommentCreated}
            />
          ))}
        </ul>
      ) : (
        null
      )}

      <CommentDraft
        label="Seu comentário"
        rootPostId={rootPostId}
        onNotice={onNotice}
        onCommentCreated={onCommentCreated}
      />
    </section>
  )
}

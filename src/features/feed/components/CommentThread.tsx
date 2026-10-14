import { useState } from 'react'
import type { FeedComment } from '../types/feed.types'
import { Avatar } from './Avatar'

function Comment({ comment, onNotice }: { comment: FeedComment; onNotice: (message: string) => void }) {
  const [replying, setReplying] = useState(false)
  return <li className="feed-comment"><div className="feed-comment-row"><Avatar student={comment.author} small /><div><strong>{comment.author.name}</strong><p>{comment.text}</p><button className="feed-text-button" aria-expanded={replying} onClick={() => setReplying(!replying)}>Responder</button></div></div>
    {replying && <CommentDraft label={`Responder a ${comment.author.name}`} onNotice={onNotice} />}
    {comment.replies && <ul className="feed-replies">{comment.replies.map(reply => <Comment key={reply.id} comment={reply} onNotice={onNotice} />)}</ul>}
  </li>
}

function CommentDraft({ label, onNotice }: { label: string; onNotice: (message: string) => void }) {
  const [text, setText] = useState('')
  return <form className="feed-comment-form" onSubmit={event => { event.preventDefault(); onNotice('Comentário não enviado. Disponível quando a integração estiver pronta; o texto permanece como rascunho.') }}><label>{label}<textarea value={text} onChange={event => setText(event.target.value)} maxLength={1500} rows={2} placeholder="Acrescente uma ideia à conversa…" /></label><div><small>Rascunho local</small><button className="feed-text-button" disabled={!text.trim()} type="submit">Enviar comentário</button></div></form>
}

// comment reply pattern: indented replies and inline reply drafts.
export function CommentThread({ comments, onNotice }: { comments: FeedComment[]; onNotice: (message: string) => void }) {
  return <section className="feed-comments" aria-label="Comentários demonstrativos"><p className="feed-caption">Conversa de exemplo</p>{comments.length ? <ul>{comments.map(comment => <Comment key={comment.id} comment={comment} onNotice={onNotice} />)}</ul> : <p className="feed-muted">Toda boa conversa começa com uma ideia.</p>}<CommentDraft label="Seu comentário" onNotice={onNotice} /></section>
}

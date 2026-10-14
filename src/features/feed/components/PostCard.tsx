import { useState } from 'react'
import { ArrowUpRight, Bookmark, BookOpen, Heart, MessageCircle, MoreHorizontal, Paperclip, Share2, Sparkles } from 'lucide-react'
import type { FeedPost } from '../types/feed.types'
import { Avatar } from './Avatar'
import { CommentThread } from './CommentThread'

interface Props { post: FeedPost; saved: boolean; liked: boolean; onLike: () => void; onSave: () => void; onNotice: (message: string) => void }
// Ruixen post structure + Kokonut featured variant and engagement interactions.
export function PostCard({ post, saved, liked, onLike, onSave, onNotice }: Props) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  return <article className={`feed-panel feed-post ${post.featured ? 'feed-post--featured' : ''}`} aria-labelledby={`${post.id}-author`}>
    {post.featured && <div className="feed-featured-label"><Sparkles size={14} />Uma conversa para fazer parte<span>Destaque demonstrativo</span></div>}
    <div className="feed-post-header"><Avatar student={post.author} /><div className="feed-author"><h2 id={`${post.id}-author`}>{post.author.name}</h2><p>{post.author.course} · {post.author.institution}</p><span>{post.timeLabel} · {post.localDemo ? 'Só na demonstração' : 'Exemplo'}</span></div><button className="feed-icon-button" aria-label={`Opções da publicação de ${post.author.name}`} aria-expanded={optionsOpen} aria-controls={`${post.id}-options`} onClick={() => setOptionsOpen(!optionsOpen)}><MoreHorizontal size={22} /></button></div>
    {optionsOpen && <div id={`${post.id}-options`} className="feed-post-options"><button onClick={() => { onSave(); setOptionsOpen(false) }}>{saved ? 'Remover dos salvos locais' : 'Salvar nesta sessão'}</button><button onClick={() => { onNotice(post.localDemo ? 'Publicação criada nesta demonstração. Não foi salva e desaparecerá ao atualizar a página.' : 'Publicação fictícia, criada para demonstrar o feed do Sabires.'); setOptionsOpen(false) }}>Sobre esta publicação</button></div>}
    {post.text && <p className="feed-post-text">{post.text}</p>}
    {!!post.attachments?.length && <div className="feed-post-attachments"><p className="feed-caption">Anexos demonstrativos · Arquivos não enviados</p><ul>{post.attachments.map((attachment, index) => <li key={`${attachment.name}-${index}`}><Paperclip size={16} aria-hidden="true" /><span>{attachment.name}</span><small>{new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(attachment.size / 1024)} KB</small></li>)}</ul></div>}
    {post.resource && <button className="feed-resource" onClick={() => onNotice('Este material é uma prévia ilustrativa. Ainda não há um arquivo para abrir.')} aria-label={`${post.resource.title} — material ilustrativo`}><div className="feed-resource-art" aria-hidden="true"><BookOpen size={34} /><span>01<br /><i>entender<br />para explicar.</i></span><div className="feed-resource-circles" /></div><div className="feed-resource-copy"><span>{post.resource.label}</span><strong>{post.resource.title}</strong><p>{post.resource.description}</p></div><ArrowUpRight size={19} /></button>}
    <div className="feed-post-meta"><span className="feed-topic">{post.topic}</span><span><Heart size={13} />{post.likes + Number(liked)}<span className="feed-meta-separator">·</span>{post.comments.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0)} comentários</span></div>
    <div className="feed-post-actions"><button aria-pressed={liked} title="Curtir apenas nesta sessão" className={liked ? 'is-selected' : ''} onClick={onLike}><Heart size={19} fill={liked ? 'currentColor' : 'none'} /><span>{liked ? 'Curtiu' : 'Curtir'}</span></button><button aria-expanded={commentsOpen} aria-controls={`${post.id}-comments`} onClick={() => setCommentsOpen(!commentsOpen)}><MessageCircle size={19} /><span>Comentar</span></button><button onClick={() => onNotice('Compartilhamento disponível quando a integração estiver pronta. Esta publicação é demonstrativa.')}><Share2 size={18} /><span>Compartilhar</span></button><button className={saved ? 'is-selected' : ''} aria-pressed={saved} aria-label={saved ? 'Remover dos salvos nesta sessão' : 'Salvar nesta sessão'} onClick={onSave}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /></button></div>
    <div id={`${post.id}-comments`} hidden={!commentsOpen}><CommentThread comments={post.comments} onNotice={onNotice} /></div>
  </article>
}

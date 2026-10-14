import { useRef, useState } from 'react'
import { ImagePlus, Paperclip, PenLine, X } from 'lucide-react'
import { useDemoSession } from '../../demo/demoContext'
import { Avatar } from './Avatar'
import type { DemoPostDraft } from '../types/feed.types'

// Composer Input pattern: text, removable attachments and explicit draft state.
export function PostComposer({ onPublish }: { onPublish: (draft: DemoPostDraft) => void }) {
  const { viewer: mockViewer } = useDemoSession()
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileInput = useRef<HTMLInputElement>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  function publishDemo() {
    if (!text.trim() && files.length === 0) return
    onPublish({ text, attachments: files.map(file => ({ name: file.name, size: file.size })) })
    setText('')
    setFiles([])
    setExpanded(false)
  }
  function addFiles(list: FileList | null) {
    const selected = Array.from(list ?? [])
    if (selected.length) setFiles(previous => [...previous, ...selected])
    setExpanded(true)
  }
  return <section className="feed-panel feed-composer" aria-label="Criar rascunho de publicação">
    <div className="feed-composer-top"><Avatar student={mockViewer} /><label className="feed-compose-field"><span className="feed-sr-only">O que você quer compartilhar hoje?</span><textarea rows={expanded ? 4 : 1} maxLength={3000} value={text} onFocus={() => setExpanded(true)} onChange={event => setText(event.target.value)} placeholder="O que você quer compartilhar hoje?" /></label></div>
    {expanded && <div className="feed-draft-info"><span>Publicação só na demonstração. Desaparece ao atualizar.</span><span>{text.length}/3000</span></div>}
    {files.length > 0 && <p className="feed-attachment-notice">Anexos: apenas nome e tamanho serão exibidos. Nenhum arquivo será enviado.</p>}
    {files.length > 0 && <ul className="feed-attachments">{files.map((file, index) => <li key={`${file.name}-${index}`}><Paperclip size={14} /><span>{file.name}</span><button className="feed-icon-button" aria-label={`Remover ${file.name}`} onClick={() => setFiles(previous => previous.filter((_, item) => item !== index))}><X size={14} /></button></li>)}</ul>}
    <input ref={fileInput} className="feed-sr-only" type="file" tabIndex={-1} multiple aria-label="Selecionar anexos" onChange={event => { addFiles(event.target.files); event.target.value = '' }} />
    <input ref={photoInput} className="feed-sr-only" type="file" tabIndex={-1} accept="image/*" multiple aria-label="Selecionar fotos" onChange={event => { addFiles(event.target.files); event.target.value = '' }} />
    <div className="feed-composer-actions"><button onClick={() => photoInput.current?.click()}><ImagePlus size={19} />Foto</button><button onClick={() => fileInput.current?.click()}><Paperclip size={19} />Anexo</button><button className="feed-primary" disabled={!text.trim() && files.length === 0} onClick={publishDemo}><PenLine size={16} />Publicar</button></div>
  </section>
}

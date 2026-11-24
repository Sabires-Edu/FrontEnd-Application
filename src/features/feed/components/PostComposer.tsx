
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, PenLine, X } from 'lucide-react'
import { Avatar } from './Avatar'
import { getMyProfile } from '../../profile/services/profileService'
import type { Student } from '../types/feed.types'

interface Props {
  onPublish: (content: string, images: File[]) => Promise<boolean>
}

export function PostComposer({ onPublish }: Props) {
  const [viewer, setViewer] = useState<Student | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [publishing, setPublishing] = useState(false)

  const photoInput = useRef<HTMLInputElement>(null)

  // Busca os dados do usuário autenticado
  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getMyProfile()
        const profile = result.response.me

        setViewer({
          id: profile.userId,
          name: `${profile.firstName} ${profile.lastName}`,
          initials: `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase(),
          photoUrl: profile.profilePicture ?? undefined,
          course: '',
          institution: '',
          tone: 'teal',
        })
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      }
    }

    loadProfile()
  }, [])

  // Adiciona imagens selecionadas
  function addFiles(list: FileList | null) {
    const selected = Array.from(list ?? [])

    if (selected.length > 0) {
      setFiles(previous => [...previous, ...selected])
      setExpanded(true)
    }
  }

  // Remove uma imagem selecionada
  function removeFile(index: number) {
    setFiles(previous =>
      previous.filter((_, item) => item !== index)
    )
  }

  // Publica na API
  async function handlePublish() {
    if ((!text.trim() && files.length === 0) || publishing) return

    setPublishing(true)

    try {
      const success = await onPublish(text.trim(), files)

      if (success) {
        setText('')
        setFiles([])
        setExpanded(false)
      }
    } finally {
      setPublishing(false)
    }
  }

  return (
    <section
      className="feed-panel feed-composer"
      aria-label="Criar publicação"
    >
      <div className="feed-composer-top">
        {viewer && <Avatar student={viewer} />}

        <label className="feed-compose-field">
          <span className="feed-sr-only">
            O que você quer compartilhar hoje?
          </span>

          <textarea
            rows={expanded ? 4 : 1}
            maxLength={3000}
            value={text}
            onFocus={() => setExpanded(true)}
            onChange={event => setText(event.target.value)}
            placeholder="O que você quer compartilhar hoje?"
          />
        </label>
      </div>

      {expanded && (
        <div className="feed-draft-info">
          <span>
            Compartilhe suas ideias com a comunidade.
          </span>

          <span>{text.length}/3000</span>
        </div>
      )}

      {files.length > 0 && (
        <ul className="feed-attachments">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <ImagePlus size={14} />

              <span>{file.name}</span>

              <button
                type="button"
                className="feed-icon-button"
                aria-label={`Remover ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={photoInput}
        className="feed-sr-only"
        type="file"
        tabIndex={-1}
        accept="image/*"
        multiple
        aria-label="Selecionar fotos"
        onChange={event => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <div className="feed-composer-actions">
        <button
          type="button"
          onClick={() => photoInput.current?.click()}
        >
          <ImagePlus size={19} />
          Foto
        </button>

        <button
          type="button"
          className="feed-primary"
          disabled={
            publishing ||
            (!text.trim() && files.length === 0)
          }
          onClick={handlePublish}
        >
          <PenLine size={16} />
          {publishing ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </section>
  )
}

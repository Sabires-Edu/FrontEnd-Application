
import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Avatar } from '../../feed/components/Avatar'
import type { OwnProfile, ProfileDetails } from '../types/profile.types'

interface Props {
  profile: OwnProfile
  focusPhoto: boolean
  onCancel: () => void
  onSave: (details: ProfileDetails, photo?: File) => void | Promise<void>
}

type Errors = Partial<Record<keyof ProfileDetails | 'photo', string>>

const fields = [
  { name: 'firstName', label: 'Nome', type: 'text', max: 60 },
  { name: 'lastName', label: 'Sobrenome', type: 'text', max: 80 },
  { name: 'birthDate', label: 'Data de nascimento', type: 'date', max: undefined },
] as const

const formationOptions = [
  'Ensino Médio',
  'Ensino Superior',
  'Graduado',
  'Professor',  
  'Outros',
]

export function ProfileEditor({ profile, focusPhoto, onCancel, onSave }: Props) {
  const [values, setValues] = useState<ProfileDetails>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    formation: profile.formation,
    birthDate: profile.birthDate,
    biography: profile.biography,
  })

  const [errors, setErrors] = useState<Errors>({})
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null)
  const [checkingPhoto, setCheckingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const previewUrl = useRef<string | undefined>(undefined)
  const photoRequest = useRef(0)

  const today = new Date()
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  useEffect(() => {
    const dialog = dialogRef.current

    const opener = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    dialog?.showModal()

    if (focusPhoto) photoRef.current?.focus()

    return () => {
      photoRequest.current += 1

      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current)
      }

      dialog?.close()
      opener?.focus()
    }
  }, [focusPhoto])

  function discardPhoto() {
    photoRequest.current += 1

    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current)
    }

    previewUrl.current = undefined
    setPhoto(null)
    setCheckingPhoto(false)

    setErrors(previous => ({
      ...previous,
      photo: undefined,
    }))

    if (photoRef.current) {
      photoRef.current.value = ''
    }
  }

  async function selectPhoto(file?: File) {
    if (!file) return

    discardPhoto()

    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setErrors(previous => ({
        ...previous,
        photo: 'Escolha uma imagem JPEG, PNG ou WebP de até 5 MB.',
      }))
      return
    }

    const request = ++photoRequest.current
    setCheckingPhoto(true)

    try {
      const bitmap = await createImageBitmap(file)

      const validDimensions = bitmap.width <= 8192 && bitmap.height <= 8192

      bitmap.close()

      if (request !== photoRequest.current) return

      if (!validDimensions) {
        throw new Error('Image too large')
      }

      const url = URL.createObjectURL(file)

      previewUrl.current = url
      setPhoto({ file, url })

    } catch {
      if (request === photoRequest.current) {
        setErrors(previous => ({
          ...previous,
          photo: 'Não foi possível abrir a imagem. Use um arquivo válido de até 8192 × 8192 pixels.',
        }))
      }
    } finally {
      if (request === photoRequest.current) {
        setCheckingPhoto(false)
      }
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (checkingPhoto || errors.photo || saving) return

    const next = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      formation: values.formation.trim(),
    }

    const invalid: Errors = {}

    if (!next.firstName || next.firstName.length > 60) {
      invalid.firstName = 'Informe seu nome (até 60 caracteres).'
    }

    if (!next.lastName || next.lastName.length > 80) {
      invalid.lastName = 'Informe seu sobrenome (até 80 caracteres).'
    }

    if (
      next.birthDate &&
      (
        !/^\d{4}-\d{2}-\d{2}$/.test(next.birthDate) ||
        Number.isNaN(Date.parse(next.birthDate)) ||
        next.birthDate < '1900-01-01' ||
        next.birthDate > maxDate
      )
    ) {
      invalid.birthDate = 'Informe uma data entre 1900 e hoje, ou deixe em branco.'
    }

    if (next.biography.length > 500) {
      invalid.biography = 'Use até 500 caracteres na biografia.'
    }

    setErrors(invalid)

    const firstError = Object.keys(invalid)[0]

    if (firstError) {
      dialogRef.current
        ?.querySelector<HTMLElement>(`[name="${firstError}"]`)
        ?.focus()

      return
    }

    try {
      setSaving(true)
      await onSave(next, photo?.file)
    } finally {
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="profile-editor"
      aria-labelledby="edit-profile-title"
      aria-describedby="edit-profile-note"
      onCancel={event => {
        event.preventDefault()
        onCancel()
      }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return

        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]'
          )
        ).filter(control => control.getClientRects().length > 0)

        const first = controls[0]
        const last = controls.at(-1)

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <form noValidate onSubmit={save}>
        <div className="profile-editor-heading">
          <h2 id="edit-profile-title">Editar perfil</h2>

          <button
            type="button"
            className="feed-icon-button"
            aria-label="Fechar edição"
            onClick={onCancel}
            disabled={saving}
          >
            <X size={21} />
          </button>
        </div>

        <p id="edit-profile-note">
          Atualize suas informações pessoais e personalize seu perfil.
        </p>

        <div className="profile-photo-editor">
          <Avatar student={{ ...profile, photoUrl: photo?.url ?? profile.photoUrl }} />

          <div>
            <label htmlFor="profile-photo">
              <Camera size={17} />
              Foto de perfil
            </label>

            <input
              ref={photoRef}
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="photo-help photo-error"
              aria-invalid={!!errors.photo}
              onChange={event => {
                void selectPhoto(event.target.files?.[0])
                event.target.value = ''
              }}
            />

            <p id="photo-help">
              JPEG, PNG ou WebP · Até 5 MB
            </p>
          </div>
        </div>

        <p id="photo-error" className="profile-error" role="status">
          {checkingPhoto ? 'Verificando imagem…' : errors.photo}
        </p>

        {(photo || errors.photo) && (
          <button
            type="button"
            className="feed-text-button"
            onClick={discardPhoto}
            disabled={saving}
          >
            Descartar foto selecionada
          </button>
        )}

        <div className="profile-fields">
          {fields.map(field => (
            <div key={field.name}>
              <label htmlFor={`profile-${field.name}`}>
                {field.label}
              </label>

              <input
                id={`profile-${field.name}`}
                name={field.name}
                type={field.type}
                maxLength={field.max}
                min={field.type === 'date' ? '1900-01-01' : undefined}
                max={field.type === 'date' ? maxDate : undefined}
                value={values[field.name]}
                aria-invalid={!!errors[field.name]}
                aria-describedby={`error-${field.name}`}
                onChange={event =>
                  setValues(previous => ({
                    ...previous,
                    [field.name]: event.target.value,
                  }))
                }
              />

              <p id={`error-${field.name}`} className="profile-error">
                {errors[field.name]}
              </p>
            </div>
          ))}

          <div>
            <label htmlFor="profile-formation">
              Formação acadêmica
            </label>

            <select
              id="profile-formation"
              name="formation"
              value={values.formation}
              aria-invalid={!!errors.formation}
              aria-describedby="error-formation"
              onChange={event =>
                setValues(previous => ({
                  ...previous,
                  formation: event.target.value,
                }))
              }
            >
              <option value="">Selecione sua formação</option>

              {formationOptions.map(formation => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>

            <p id="error-formation" className="profile-error">
              {errors.formation}
            </p>
          </div>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-biography">Biografia</label>

          <textarea
            id="profile-biography"
            name="biography"
            rows={4}
            maxLength={500}
            value={values.biography}
            aria-invalid={!!errors.biography}
            aria-describedby="biography-count biography-error"
            onChange={event =>
              setValues(previous => ({
                ...previous,
                biography: event.target.value,
              }))
            }
          />

          <p id="biography-count" className="feed-caption">
            {values.biography.length}/500 caracteres
          </p>

          <p id="biography-error" className="profile-error">
            {errors.biography}
          </p>
        </div>

        <p className="profile-edit-note">
          A foto selecionada e a data de nascimento ainda não são enviadas
          ao servidor. Os demais campos disponíveis são salvos no perfil.
        </p>

        <div className="profile-editor-actions">
          <button
            type="button"
            className="feed-connect"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            className="feed-primary"
            type="submit"
            disabled={checkingPhoto || !!errors.photo || saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

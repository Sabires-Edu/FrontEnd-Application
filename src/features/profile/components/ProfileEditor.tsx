
// Importações dos recursos do React
import { useEffect, useRef, useState } from 'react'

// Ícones utilizados no editor
import { Camera, X } from 'lucide-react'

// Componente responsável por exibir a foto do perfil
import { Avatar } from '../../feed/components/Avatar'

// Tipos utilizados para definir a estrutura dos dados do perfil
import type { OwnProfile, ProfileDetails } from '../types/profile.types'

// Define as propriedades que o componente recebe
interface Props {
  profile: OwnProfile
  focusPhoto: boolean
  onCancel: () => void
  onSave: (details: ProfileDetails, photo?: File) => void
}

// Define os possíveis erros dos campos do formulário
type Errors = Partial<Record<keyof ProfileDetails | 'photo', string>>

// Campos de texto e data que serão exibidos no formulário
const fields = [
  { name: 'firstName', label: 'Nome', type: 'text', max: 60 },
  { name: 'lastName', label: 'Sobrenome', type: 'text', max: 80 },
  { name: 'birthDate', label: 'Data de nascimento', type: 'date', max: undefined },
] as const

// Opções disponíveis para formação acadêmica
const formationOptions = [
  'Ensino Médio',
  'Ensino Superior',
  'Graduado',
  'Professor',
  'Administrador',
  'Outros',
]

// Componente principal responsável pela edição do perfil
export function ProfileEditor({ profile, focusPhoto, onCancel, onSave }: Props) {

  // Armazena os valores preenchidos nos campos do formulário
  const [values, setValues] = useState<ProfileDetails>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    formation: profile.formation,
    birthDate: profile.birthDate,
    biography: profile.biography,
  })

  // Armazena as mensagens de erro de cada campo
  const [errors, setErrors] = useState<Errors>({})

  // Armazena a foto selecionada e sua URL de visualização
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null)

  // Informa se a imagem ainda está sendo verificada
  const [checkingPhoto, setCheckingPhoto] = useState(false)

  // Referência ao elemento principal do modal
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Referência ao campo de seleção de foto
  const photoRef = useRef<HTMLInputElement>(null)

  // Guarda a URL temporária criada para visualizar a imagem
  const previewUrl = useRef<string | undefined>(undefined)

  // Identifica a solicitação de foto atual para evitar resultados antigos
  const photoRequest = useRef(0)

  // Obtém a data atual para impedir o cadastro de datas futuras
  const today = new Date()

  // Formata a data atual no padrão utilizado pelo input date (AAAA-MM-DD)
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Executa ações quando o modal é aberto ou fechado
  useEffect(() => {
    const dialog = dialogRef.current

    // Guarda o elemento que estava selecionado antes de abrir o modal
    const opener = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    // Abre o modal
    dialog?.showModal()

    // Se solicitado, coloca o foco diretamente no campo de foto
    if (focusPhoto) photoRef.current?.focus()

    // Executa a limpeza quando o componente é fechado
    return () => {
      photoRequest.current += 1

      // Libera a URL temporária da imagem
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current)
      }

      // Fecha o modal e devolve o foco ao elemento anterior
      dialog?.close()
      opener?.focus()
    }
  }, [focusPhoto])

  // Descarta a foto selecionada e limpa seus dados temporários
  function discardPhoto() {
    photoRequest.current += 1

    // Libera a URL criada para a visualização da imagem
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current)
    }

    previewUrl.current = undefined
    setPhoto(null)
    setCheckingPhoto(false)

    // Remove possíveis mensagens de erro relacionadas à foto
    setErrors(previous => ({ ...previous, photo: undefined }))

    // Limpa o campo de seleção de arquivo
    if (photoRef.current) {
      photoRef.current.value = ''
    }
  }

  // Recebe e verifica a foto selecionada pelo usuário
  async function selectPhoto(file?: File) {
    if (!file) return

    // Limpa uma seleção anterior
    discardPhoto()

    // Verifica o formato e o tamanho do arquivo
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

    // Identifica a solicitação atual e inicia a verificação
    const request = ++photoRequest.current
    setCheckingPhoto(true)

    try {
      // Tenta abrir a imagem para verificar suas dimensões
      const bitmap = await createImageBitmap(file)

      const validDimensions = bitmap.width <= 8192 && bitmap.height <= 8192

      // Libera os recursos utilizados na leitura da imagem
      bitmap.close()

      // Ignora o resultado caso outra foto tenha sido selecionada
      if (request !== photoRequest.current) return

      if (!validDimensions) {
        throw new Error('Image too large')
      }

      // Cria uma URL temporária para exibir a prévia da foto
      const url = URL.createObjectURL(file)

      previewUrl.current = url

      // Guarda o arquivo e sua URL para exibição
      setPhoto({ file, url })

    } catch {
      // Exibe uma mensagem caso a imagem não possa ser aberta
      if (request === photoRequest.current) {
        setErrors(previous => ({
          ...previous,
          photo: 'Não foi possível abrir a imagem. Use um arquivo válido de até 8192 × 8192 pixels.',
        }))
      }
    } finally {
      // Finaliza a verificação da imagem
      if (request === photoRequest.current) {
        setCheckingPhoto(false)
      }
    }
  }

  // Valida os dados e executa a ação de salvar o formulário
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Impede o envio enquanto a foto estiver sendo verificada ou houver erro nela
    if (checkingPhoto || errors.photo) return

    // Prepara os dados removendo espaços desnecessários do início e do fim
    const next = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      formation: values.formation.trim(),
    }

    // Objeto que armazenará os erros encontrados
    const invalid: Errors = {}

    // Valida o nome
    if (!next.firstName || next.firstName.length > 60) {
      invalid.firstName = 'Informe seu nome (até 60 caracteres).'
    }

    // Valida o sobrenome
    if (!next.lastName || next.lastName.length > 80) {
      invalid.lastName = 'Informe seu sobrenome (até 80 caracteres).'
    }

    // Valida a data de nascimento, caso tenha sido preenchida
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

    // Limita a biografia a 500 caracteres
    if (next.biography.length > 500) {
      invalid.biography = 'Use até 500 caracteres na biografia.'
    }

    // Atualiza os erros encontrados
    setErrors(invalid)

    // Identifica o primeiro campo que apresentou erro
    const firstError = Object.keys(invalid)[0]

    // Coloca o foco no campo com erro e interrompe o salvamento
    if (firstError) {
      dialogRef.current
        ?.querySelector<HTMLElement>(`[name="${firstError}"]`)
        ?.focus()

      return
    }

    // Envia os dados para a função responsável por atualizar o perfil
    onSave(next, photo?.file)
  }

  // Estrutura visual do modal de edição
  return (
    <dialog
      ref={dialogRef}
      className="profile-editor"
      aria-labelledby="edit-profile-title"
      aria-describedby="edit-profile-note"

      // Impede o fechamento padrão do modal e utiliza a função de cancelamento
      onCancel={event => {
        event.preventDefault()
        onCancel()
      }}

      // Controla a navegação pelo teclado dentro do modal
      onKeyDown={event => {
        if (event.key !== 'Tab') return

        // Busca os elementos que podem receber foco
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]'
          )
        ).filter(control => control.getClientRects().length > 0)

        const first = controls[0]
        const last = controls.at(-1)

        // Impede que o foco saia do modal ao navegar com Tab
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

        {/* Cabeçalho do modal com título e botão para fechar */}
        <div className="profile-editor-heading">
          <h2 id="edit-profile-title">Editar perfil</h2>

          <button
            type="button"
            className="feed-icon-button"
            aria-label="Fechar edição"
            onClick={onCancel}
          >
            <X size={21} />
          </button>
        </div>

        {/* Aviso sobre o funcionamento atual da demonstração */}
        <p id="edit-profile-note">
          Ajuste seu perfil nesta demonstração. As alterações desaparecem ao atualizar a página.
        </p>

        {/* Área de seleção e visualização da foto de perfil */}
        <div className="profile-photo-editor">
          <Avatar student={{ ...profile, photoUrl: photo?.url ?? profile.photoUrl }} />

          <div>
            <label htmlFor="profile-photo">
              <Camera size={17} />
              Foto de perfil
            </label>

            {/* Campo para selecionar uma imagem do computador */}
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
              JPEG, PNG ou WebP · Até 5 MB · Sem upload
            </p>
          </div>
        </div>

        {/* Exibe mensagens de erro ou o status da verificação da foto */}
        <p id="photo-error" className="profile-error" role="status">
          {checkingPhoto ? 'Verificando imagem…' : errors.photo}
        </p>

        {/* Mostra o botão para descartar a imagem selecionada */}
        {(photo || errors.photo) && (
          <button
            type="button"
            className="feed-text-button"
            onClick={discardPhoto}
          >
            Descartar foto selecionada
          </button>
        )}

        {/* Grade com os campos principais do perfil */}
        <div className="profile-fields">

          {/* Percorre os campos definidos no array fields */}
          {fields.map(field => (
            <div key={field.name}>
              <label htmlFor={`profile-${field.name}`}>
                {field.label}
              </label>

              {/* Campo de nome, sobrenome ou data de nascimento */}
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

              {/* Exibe o erro correspondente ao campo */}
              <p id={`error-${field.name}`} className="profile-error">
                {errors[field.name]}
              </p>
            </div>
          ))}

          {/* Campo de seleção da formação acadêmica */}
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
              {/* Opção inicial exibida antes da escolha */}
              <option value="">Selecione sua formação</option>

              {/* Gera automaticamente as opções de formação */}
              {formationOptions.map(formation => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>

            {/* Exibe eventual mensagem de erro da formação */}
            <p id="error-formation" className="profile-error">
              {errors.formation}
            </p>
          </div>
        </div>

        {/* Área destinada à biografia do usuário */}
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

          {/* Contador de caracteres da biografia */}
          <p id="biography-count" className="feed-caption">
            {values.biography.length}/500 caracteres
          </p>

          {/* Mensagem de erro da biografia */}
          <p id="biography-error" className="profile-error">
            {errors.biography}
          </p>
        </div>

        {/* Aviso sobre informações que ainda são apenas exemplos visuais */}
        <p className="profile-edit-note">
          Curso, instituição e interesses são exemplos visuais. Opções de status aguardam definição e não são editáveis nesta etapa.
        </p>

        {/* Botões para cancelar ou aplicar as alterações */}
        <div className="profile-editor-actions">
          <button
            type="button"
            className="feed-connect"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            className="feed-primary"
            type="submit"
            disabled={checkingPhoto || !!errors.photo}
          >
            Aplicar na demonstração
          </button>
        </div>
      </form>
    </dialog>
  )
}

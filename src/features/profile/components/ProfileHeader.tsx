
import { BookOpen, Camera, Pencil } from 'lucide-react'
import { Avatar } from '../../feed/components/Avatar'
import type { Profile } from '../types/profile.types'

interface Props {
  profile: Profile
  own: boolean
  onEdit: (photo: boolean) => void
  onOpenFollowList: (type: 'followers' | 'following') => void
}

export function ProfileHeader({
  profile,
  own,
  onEdit,
  onOpenFollowList,
}: Props) {
  return (
    <section className="feed-panel profile-hero" aria-labelledby="profile-name">
      <div className="profile-cover">
        <BookOpen size={24} aria-hidden="true" />
        <span>Aprender. Compartilhar. Fazer parte.</span>
        <span className="profile-cover-label">SABIRES CONECTA</span>
      </div>

      <div className="profile-identity">
        <div className="profile-avatar-wrap">
          <Avatar student={profile} />

          {own && (
            <button
              className="profile-camera"
              aria-label="Alterar foto de perfil"
              onClick={() => onEdit(true)}
            >
              <Camera size={18} />
            </button>
          )}
        </div>

        <div className="profile-identity-copy">
          <p className="feed-eyebrow">
            {own
              ? 'SEU ESPAÇO NA COMUNIDADE'
              : 'ESTUDANTE DA COMUNIDADE'}
          </p>

          <h1 id="profile-name">{profile.name}</h1>

          <p className="profile-bio">
            {profile.biography || 'Este perfil ainda não tem uma biografia.'}
          </p>
        </div>

        <div className="profile-stats">
          <button
            type="button"
            className="profile-stat"
            onClick={() => onOpenFollowList('followers')}
          >
            <strong>{profile.followers ?? 0}</strong>
            <span>Seguidores</span>
          </button>

          <button
            type="button"
            className="profile-stat"
            onClick={() => onOpenFollowList('following')}
          >
            <strong>{profile.following ?? 0}</strong>
            <span>Seguindo</span>
          </button>
        </div>

        {own && (
          <div className="profile-actions">
            <button className="feed-primary" onClick={() => onEdit(false)}>
              <Pencil size={16} />
              Editar perfil
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

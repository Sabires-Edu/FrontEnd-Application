import { BookOpen, Camera, GraduationCap, MessageCircle, Pencil } from 'lucide-react'
import { Avatar } from '../../feed/components/Avatar'
import { ConnectionButton } from '../../demo/ConnectionButton'
import type { Profile } from '../types/profile.types'

interface Props { profile: Profile; own: boolean; onEdit: (photo: boolean) => void; onNotice: (message: string) => void }
export function ProfileHeader({ profile, own, onEdit, onNotice }: Props) {
  return <section className="feed-panel profile-hero" aria-labelledby="profile-name">
    <div className="profile-cover"><BookOpen size={24} aria-hidden="true" /><span>Aprender. Compartilhar. Fazer parte.</span><span className="profile-cover-label">SABER CONECTA</span></div>
    <div className="profile-identity"><div className="profile-avatar-wrap"><Avatar student={profile} />{own && <button className="profile-camera" aria-label="Alterar foto de perfil" onClick={() => onEdit(true)}><Camera size={18} /></button>}</div>
      <div className="profile-identity-copy"><p className="feed-eyebrow">{own ? 'SEU ESPAÇO NA COMUNIDADE' : 'ESTUDANTE DA COMUNIDADE'}</p><h1 id="profile-name">{profile.name}</h1><p className="profile-academic"><GraduationCap size={18} />{profile.course} · {profile.institution}</p><p className="profile-bio">{profile.biography || 'Este perfil ainda não tem uma biografia.'}</p></div>
      <div className="profile-actions">{own ? <button className="feed-primary" onClick={() => onEdit(false)}><Pencil size={16} />Editar perfil</button> : <><ConnectionButton userId={profile.id} onNotice={onNotice} /><button className="feed-connect" onClick={() => onNotice('Mensagens está em desenvolvimento. Nenhuma mensagem foi enviada.')}><MessageCircle size={16} />Mensagem · Em breve</button></>}</div>
    </div>
  </section>
}

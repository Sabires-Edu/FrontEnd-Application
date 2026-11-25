import type { Student } from '../types/feed.types'

export function Avatar({ student, small = false }: { student: Student; small?: boolean }) {
  if (student.photoUrl) return <img className={`feed-avatar${small ? ' feed-avatar--small' : ''}`} src={student.photoUrl} alt={`Foto de ${student.name}`} />
  return <span aria-hidden="true" className={`feed-avatar feed-avatar--${student.tone}${small ? ' feed-avatar--small' : ''}`}>{student.initials}</span>
}

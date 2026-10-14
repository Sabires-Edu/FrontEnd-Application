import type { Student } from '../types/feed.types'

export function Avatar({ student, small = false }: { student: Student; small?: boolean }) {
  return <span aria-hidden="true" className={`feed-avatar feed-avatar--${student.tone}${small ? ' feed-avatar--small' : ''}`}>{student.initials}</span>
}

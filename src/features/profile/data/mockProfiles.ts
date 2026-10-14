import { mockStudents, mockViewer } from '../../feed/data/mockFeed'
import type { OwnProfile, Profile } from '../types/profile.types'

export const mockOwnProfile: OwnProfile = {
  ...mockViewer,
  firstName: 'Alex', lastName: 'Santos', email: 'alex.santos@example.com',
  birthDate: '2003-05-14',
  biography: 'Aprendendo a transformar curiosidade em projetos. Gosto de trocar ideias sobre tecnologia, compartilhar descobertas e encontrar novos jeitos de estudar.',
  interests: ['Desenvolvimento web', 'Aprendizagem colaborativa', 'Tecnologia'],
}

export const mockPublicProfiles: Profile[] = mockStudents.map(student => ({
  ...student, biography: student.bio, interests: [student.interest],
}))

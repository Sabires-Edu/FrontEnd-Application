import type { FeedPost, Student, SuggestedStudent } from '../types/feed.types'

// Entirely fictional fixtures, including engagement counts and relative times.
export const mockViewer: Student = {
  id: 'demo-viewer', name: 'Alex Santos', initials: 'AS', course: 'Ciência da Computação', institution: 'UFPE', tone: 'teal',
}

export const mockStudents: SuggestedStudent[] = [
  { id: 'demo-luiza', name: 'Luiza Ferreira', initials: 'LF', course: 'Design', institution: 'UFPE', tone: 'lavender', interest: 'Design e tecnologia', bio: 'Entre interfaces, acessibilidade e um bom café. Aprendendo a criar para pessoas.' },
  { id: 'demo-pedro', name: 'Pedro Almeida', initials: 'PA', course: 'Engenharia de Software', institution: 'UnB', tone: 'blue', interest: 'Programação', bio: 'Gosto de aprender construindo. Estudando desenvolvimento web e projetos de código aberto.' },
  { id: 'demo-ana', name: 'Ana Beatriz', initials: 'AB', course: 'Psicologia', institution: 'UFMG', tone: 'peach', interest: 'Ciência e aprendizagem', bio: 'Curiosa sobre como a gente aprende. Vamos trocar referências e ideias?' },
]

export const mockPosts: FeedPost[] = [
  {
    id: 'demo-post-1', author: mockStudents[0], timeLabel: 'Há 2 horas', topic: 'Aprendizado', likes: 24,
    text: 'Uma coisa que mudou meu jeito de estudar: tentar explicar o assunto para alguém que nunca ouviu falar dele.\n\nMontei um pequeno guia sobre a técnica de Feynman com o que funcionou pra mim neste semestre. Qual método de estudo vocês mais usam?',
    resource: { title: 'Aprender de verdade, uma ideia por vez.', description: 'Um roteiro para experimentar a técnica de Feynman nos seus estudos.', label: 'CADERNO DE ESTUDOS · EXEMPLO' },
    comments: [{ id: 'demo-comment-1', author: mockStudents[2], text: 'Explicar em voz alta me ajuda muito! Também gosto de voltar ao assunto alguns dias depois.', replies: [{ id: 'demo-reply-1', author: mockStudents[0], text: 'Sim! A revisão espaçada faz toda a diferença.' }] }],
  },
  {
    id: 'demo-post-2', author: mockStudents[1], timeLabel: 'Há 4 horas', topic: 'Troca de conhecimento', likes: 18, featured: true,
    text: 'Alguém mais está começando em React e sente que entende a aula, mas trava na hora de criar algo do zero?\n\nMinha ideia é juntar uma turma para construir um projeto pequeno, trocar dúvidas e aprender no processo. Sem pressa e sem precisar saber tudo. Quem toparia?',
    comments: [],
  },
  {
    id: 'demo-post-3', author: mockStudents[2], timeLabel: 'Há 6 horas', topic: 'Vida universitária', likes: 31,
    text: 'Lembrete de quem precisou ouvir isso hoje: descansar também faz parte de aprender.\n\nTroquei uma hora relendo o mesmo texto por uma caminhada e voltei entendendo muito mais. Como vocês equilibram os estudos com o tempo de vocês?',
    comments: [],
  },
]

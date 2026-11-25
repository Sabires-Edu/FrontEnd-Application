import type { DemoConversation } from './demoContext'

// Mensagens fictícias usadas exclusivamente para demonstrar a interface.
export const mockConversations: DemoConversation[] = [
  { id: 'direct-demo-luiza', kind: 'direct', title: 'Luiza Ferreira', subtitle: 'Design · UFPE', participantIds: ['demo-viewer', 'demo-luiza'], messages: [
    { id: 'm-1', senderId: 'demo-luiza', text: 'Oi, Alex! Você chegou a ver o material sobre acessibilidade?', time: '10:32' },
    { id: 'm-2', senderId: 'demo-viewer', text: 'Vi sim! Gostei especialmente dos exemplos de navegação por teclado.', time: '10:35' },
    { id: 'm-3', senderId: 'demo-luiza', text: 'Que bom! Podemos trocar mais referências depois.', time: '10:38' },
  ] },
  { id: 'direct-demo-pedro', kind: 'direct', title: 'Pedro Almeida', subtitle: 'Engenharia de Software · UnB', participantIds: ['demo-viewer', 'demo-pedro'], messages: [
    { id: 'm-4', senderId: 'demo-pedro', text: 'Estou montando um pequeno projeto em React. Topa trocar ideias?', time: 'Ontem' },
  ] },
  { id: 'direct-demo-ana', kind: 'direct', title: 'Ana Beatriz', subtitle: 'Psicologia · UFMG', participantIds: ['demo-viewer', 'demo-ana'], messages: [
    { id: 'm-5', senderId: 'demo-ana', text: 'Compartilhei umas anotações sobre técnicas de estudo. Depois me conta o que achou!', time: 'Segunda-feira' },
  ] },
  { id: 'group-react', kind: 'group', title: 'Projeto React', subtitle: 'Grupo de estudos · 4 participantes', participantIds: ['demo-viewer', 'demo-luiza', 'demo-pedro', 'demo-ana'], messages: [
    { id: 'm-6', senderId: 'demo-pedro', text: 'Pessoal, que tal começarmos pelos componentes reutilizáveis?', time: '09:10' },
    { id: 'm-7', senderId: 'demo-luiza', text: 'Boa! Também posso fazer um esboço das telas.', time: '09:14' },
    { id: 'm-8', senderId: 'demo-viewer', text: 'Fechado! Eu ajudo com as rotas.', time: '09:18' },
  ] },
  { id: 'group-estudos', kind: 'group', title: 'Rotina de estudos', subtitle: 'Grupo de estudos · 3 participantes', participantIds: ['demo-viewer', 'demo-pedro', 'demo-ana'], messages: [
    { id: 'm-9', senderId: 'demo-ana', text: 'Qual método de revisão vocês estão usando nesta semana?', time: 'Ontem' },
    { id: 'm-10', senderId: 'demo-viewer', text: 'Estou testando revisão espaçada com cartões!', time: 'Ontem' },
  ] },
]

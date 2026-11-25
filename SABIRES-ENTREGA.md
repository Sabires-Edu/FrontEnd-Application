# Sabires Front-End — estado da entrega

## Rotas
- `/login` — login usando serviço de API existente (requer backend).
- `/cadastro` — registro usando serviço de API existente (requer backend).
- `/feed` — feed e composição de publicações de demonstração.
- `/profile` e `/profile/:userId` — perfil próprio e perfis de exemplo.
- `/usuarios` — busca de estudantes, perfis, convites de conexão simulados.
- `/postagens` — criação e leitura de postagens; filtros Todas / Minhas / Salvas.
- `/mensagens` — mensagens privadas e em grupos com envio simulado. Opção de abrir conversa via `?conversa=direct-demo-luiza`.

## Como executar
1. Abra a pasta `Sabires-frontend` no terminal.
2. Execute `npm install` (ou `npm ci`) se ainda não tiver instalado dependências.
3. Execute `npm run dev` e abra o endereço que aparecer no terminal.
4. Verifique a compilação com `npm run build` e a análise de código com `npm run lint`.

## Limitações importantes
As áreas Feed, Perfil, Usuários, Postagens e Mensagens funcionam com **dados simulados apenas em memória**. Os dados desaparecem após recarregar a página; não foram criados backend, banco de dados ou envio real de mensagens/convites.

O login e cadastro usam serviços HTTP existentes em `src/features/auth/services/authService.ts`; dependem da API definida em `src/services/api/apiClient.ts` e não criam uma sessão de usuário no front-end.

Os arquivos `.env` com segredos e a pasta `node_modules` não precisam ser distribuídos junto do código.

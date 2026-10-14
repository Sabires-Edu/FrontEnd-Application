# Home / Feed — preview demonstrativo

Abra `/feed` com `npm run dev`. Rota pública para avaliação de desenvolvimento;
não é uma rota protegida de produção. Login, cadastro, redirects, authService,
apiClient, JWT e armazenamento de token permanecem intactos.

## Referências e autoria

As seis páginas do 21st.dev e seus links de preview foram consultados em
13/10/2026. O conteúdo acessível apresentava descrições e exemplos de Usage.tsx;
o código integral de Component.tsx e a ação interativa Copy prompt não foram
extraídos. As implementações aqui são recriações próprias dos padrões, não
cópias dos componentes originais. Nenhum pacote/CLI do 21st.dev foi instalado.

| Referência | Participação na implementação |
| --- | --- |
| [SocialPostCard — Ruixen UI](https://21st.dev/@ruixen.ui/components/social-post-card) | `components/PostCard.tsx`: autor/contexto, conteúdo, prévia de material e barra de interações. Sem glassmorphism. |
| [Social Card — Kokonut UI](https://21st.dev/@kokonutd/components/social-card) | `PostCard.tsx`, variante `featured`: destaque único de conversa, ações controladas e estado visual de curtida/salvo. Não duplica publicações. A página identifica licença MIT; nenhum fonte foi copiado. |
| [comment reply — Utkarsh Pandey](https://21st.dev/@theutkarshmail/components/comment-reply) | `components/CommentThread.tsx`: conversa encadeada, recuo visual e rascunho de resposta inline. |
| [Composer Input — Ravi Katiyar](https://21st.dev/@ravikatiyar162/components/composer-input) | `components/PostComposer.tsx`: editor expansível, seleção/remoção de anexos e ações, adaptado de chat para publicação. |
| [Profile Card — Isaiah](https://21st.dev/@isaiahbjork/components/profile-card) | `components/SuggestedStudents.tsx`: descoberta de pessoas com identidade, bio expansível e ação de conexão; sem blur/revelação por letra. |
| [Sidebar — Manu Arora / Aceternity](https://21st.dev/@manuarora700/components/sidebar) | `components/FeedSidebar.tsx`: navegação recolhível e menu mobile explícito, acessível por teclado. React comum e React Router, sem Next.js. A página identifica licença MIT; nenhum fonte foi copiado. |

`src/components/ui/spotlight-card.tsx` adapta o GlowCard fornecido pelo usuário.
Mantém props originais, acrescenta teal e usa largura de 100%/altura natural no
bloco secundário “Saber conecta”. CSS único e escopado, coordenadas locais,
sem listeners globais, sem touchAction e sem efeito sob reduced-motion/touch.

## Comportamento e limites

- Fixtures fictícias exclusivamente em `data/mockFeed.ts`; tipos em
  `types/feed.types.ts` são modelos de exibição internos, não DTOs da API.
- Nenhum request de API, acesso a token ou armazenamento persistente no feed.
- Publicar adiciona um post ao topo com o perfil demonstrativo e limpa o composer.
  Texto, espaços e quebras de linha são preservados; texto vazio/só espaços não
  habilita a ação sem anexo. A confirmação informa que a publicação não foi salva.
- Anexos mantêm seleção/remoção local; o post exibe somente nome e tamanho.
  Não há upload, leitura do conteúdo, URL de preview ou download fictício. Um
  anexo sozinho permite testar o fluxo. Os arquivos são liberados do rascunho
  após publicar; a publicação guarda apenas metadados, em memória.
- Curtidas e lista de salvos são locais. Recarregar/abandonar a rota limpa tudo.
- Comentários/respostas de exemplo expandem; rascunhos não são enviados.
- Conectar/compartilhar/notificações informam indisponibilidade, sem sucesso falso.
- Busca é visual e explica que está em desenvolvimento. Navegação de estudantes
  e salvos usa vistas locais da mesma página; itens futuros não levam a outra rota.
- Explorar foi removido. Perfil, Mensagens e Postagens indicam “Em breve”; a
  vista Estudantes representa a descoberta de usuários. Cabeçalho e sidebar
  indicam corretamente a vista ativa, inclusive ao voltar pela marca Sabires.
- Material editorial é ilustração CSS local, sem URL externa ou arquivo fictício.
- `FeedContent` recebe estados ready/loading/error; a demo usa ready sem timers
  ou chamadas simuladas. Salvos vazio exercita o estado vazio naturalmente.

## Integração futura

Confirmar com André o contrato do login/JWT, envelopes e campos de GET posts/users,
paginação, IDs e parâmetros de comentários antes de implementar adapters. Não há
algoritmo de recomendação: “Para você” combina a seleção demonstrativa com os
posts locais recém-criados. `DemoPostDraft` é um modelo interno e o callback
`onPublish` separa o composer do estado da página; não é um DTO de POST.

Endpoints documentados para a futura camada de serviço: GET `/v1/posts`,
GET `/v1/users` (limit/cursor), GET `/v1/posts/{postid}`, GET
`/v1/posts/{postid}/comments` (parâmetros pendentes), POST `/v1/post` (singular),
POST `/v1/post/me/like/{postid}` e POST `/v1/users/me/follow/{userid}`.
Não criar comportamento de unlike/unfollow a partir desses endpoints sem contrato.
Serviço e adapter serão conectados quando os contratos forem conhecidos; nenhum
serviço especulativo foi necessário para este preview.

## Verificações

- `npm run lint` e `npm run build`.
- Chromium via Playwright externo ao projeto: larguras 360, 390, 768, 1024,
  1200, 1440 e 1920 px sem overflow horizontal; sem erros de página ou requests
  `/v1/` ou POST.
- Exercitados curtida, salvos/estado vazio, expansão de comentários/respostas,
  rascunho, seleção/remoção de anexo, publicação de texto e anexo isolado,
  publicação a partir de Salvos, ordem/IDs únicos, preservação de espaços e
  quebras de linha, escape de HTML e limpeza do composer. Navegação mobile,
  indicação de vista ativa e retorno com foco ao composer conferidos.
  Reload limpa os posts criados; localStorage e sessionStorage permanecem vazios.
- Tamanhos reduzidos eram regras explícitas do feed, sem zoom/transform herdado.
  Tipografia revisada por função: publicações em 16 px (15 px no celular),
  metadados em 12 px e controles em 12–14 px. Coluna central até 740 px,
  gaps de 24 px e estilos restritos ao feed. Inter/Sora e paleta preservadas.
- Checagem de contraste dos 112 elementos com texto visível na tela inicial:
  passou nos limites AA de texto normal/grande após ajustes de tons secundários.
  Não substitui auditoria completa de todos os estados e controles.
- `/`, `/login` e `/cadastro` continuam renderizando a autenticação existente.
- Revisão visual de screenshots desktop/mobile. Loading/erro estão preparados
  no componente; não foram acionados artificialmente no preview.
- Ferramentas e screenshots de verificação ficaram fora do repositório.

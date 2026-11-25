# Perfil demonstrativo do Sabires

Perfil próprio e público compartilham layout e componentes. Não há autenticação
simulada, integração HTTP, upload nem persistência. As rotas são previews públicos
de desenvolvimento, não proteção de acesso para produção.

## Rotas e roteiro de demonstração

Execute `npm run dev` e abra:

- `/profile`: perfil próprio (Alex Santos).
- `/profile/demo-viewer`: alias do perfil próprio demonstrativo.
- `/profile/demo-luiza`, `/profile/demo-pedro`, `/profile/demo-ana`: perfis públicos.
- `/profile/qualquer-id-inexistente`: estado de perfil não encontrado.

No Feed, nomes/avatares em posts, comentários e sugestões abrem perfis; o avatar
do cabeçalho e o item Perfil levam ao próprio perfil. Voltar ao feed preserva os
dados demonstrativos durante a navegação. `/feed?view=students` e
`/feed?view=saved` permitem retornar às vistas existentes, sem novas páginas.

1. Edite nome, sobrenome, e-mail, nascimento ou biografia. Cancele para descartar
   ou aplique para atualizar o perfil e a identidade exibida no Feed.
2. Selecione uma foto JPEG/PNG/WebP até 5 MB. O arquivo é decodificado localmente
   para validar a imagem; limite de 8192 px por dimensão. Cancele ou descarte a
   seleção para recuperar a foto anterior. Aplicar atualiza os avatares.
3. Publique no Feed. O post aparece na aba Publicações do seu perfil; curtidas e
   salvos também são compartilhados. Sem posts, o perfil convida a começar no Feed.
4. Abra Luiza ou outro estudante e clique Conectar: o botão passa a Solicitação
   simulada, com opção de desfazer. O mesmo estado aparece no Feed e na aba
   Conexões do perfil próprio. Não é exibida uma contagem falsa de conexões aceitas.
5. Navegue pelas abas com clique ou setas/Home/End. Editar usa `<dialog>` modal
   nativo, labels, erros por campo, foco inicial/restauração e Escape para cancelar.
6. Recarregue: todas as alterações, fotos, posts e solicitações desaparecem.

## Arquivos e reutilização

- `pages/ProfilePage.tsx`: resolução de perfil, abas, estados vazios e composição.
- `components/ProfileHeader.tsx`: capa, identidade e ações próprias/públicas.
- `components/ProfileEditor.tsx`: formulário, validação e foto temporária.
- `types/profile.types.ts`: modelos internos de exibição, sem DTOs presumidos.
- `data/mockProfiles.ts`: complementa os registros já existentes de `mockFeed`;
  não replica os estudantes nem suas publicações. Dados privados só existem no
  mock próprio; os demais perfis expõem apenas os exemplos públicos.
- `profile.css`: regras específicas, apoiadas nos estilos e tokens do Feed.
- `../demo/DemoSessionProvider.tsx` e `demoContext.ts`: estado React compartilhado
  entre as rotas de demonstração, fora das rotas de autenticação.
- `../demo/ConnectionButton.tsx`: uma interação simulada usada no Feed e Perfil.

Reutilizados sem cópia: FeedHeader, FeedSidebar, Avatar e PostCard, incluindo o
CommentThread e a variante de destaque. O GlowCard foi inspecionado, mas permanece
somente no bloco secundário do Feed. Nenhuma dependência foi instalada.

## Integração futura

| Finalidade | Endpoint documentado | Pendente |
| --- | --- | --- |
| Próprio perfil | `GET /v1/users/me` | Formato de resposta e distinção público/privado |
| Perfil público | `GET /v1/users/{userid}` | Campos, IDs e tratamento de não encontrado |
| Edição | `PATCH /v1/users/me` | Resposta e validações reais para FirstName, LastName, Email, BirthDate, StatusId, Biography |
| Foto | `PATCH /v1/users/me/picture` | Multipart ProfilePicture, limites/formatos reais e URL retornada |
| Posts próprios | `GET /v1/posts/me` | Resposta e confirmação de limit/cursor (Notion inconsistente) |
| Posts gerais | `GET /v1/posts?limit=…&cursor=…` | Resposta, paginação e eventual filtragem documentada |
| Conexões | `POST /v1/users/me/follow/{userid}` | Semântica da solicitação e resposta |
| Atualizar solicitação | `PATCH /v1/users/me/follow/{followersid}` | Significado dos estados e do identificador |
| Remover conexão | `DELETE /v1/users/me/follow/{userid}` | Semântica e autorização |

Não existe endpoint presumido para posts de outro usuário. Perfis públicos filtram
os posts locais pelo autor. StatusId não possui opções inventadas. Curso,
instituição e interesses são conteúdo visual dos mocks e não campos garantidos
de API. E-mail/nascimento aparecem apenas na visualização própria; isto é uma
convenção de UI demonstrativa, não um mecanismo de segurança.

Os callbacks do contexto permitem substituir a origem dos dados por serviço e
adapters quando o contrato estiver confirmado. Não foi criado serviço especulativo.

## Limites e verificações

- Estado compartilhado enquanto o grupo de rotas `/feed` e `/profile` permanece
  montado. Recarregar, fechar a página ou sair para Login/Cadastro limpa o estado.
- URLs de foto são revogadas ao descartar, cancelar, substituir e desmontar a
  sessão. A imagem não usa serviço externo. Anexos de posts continuam metadados.
- Rascunhos de composer/comentário são locais ao componente e podem ser perdidos
  ao navegar para outra página; não há autosave. Comentários continuam sem envio.
- Mensagens e Postagens independentes continuam Em breve. Não há edição de
  perfis alheios, solicitações recebidas fictícias ou promessa de conexão real.
- `npm run lint` e `npm run build`: aprovados.
- Chromium/Playwright externo ao projeto: edição inválida, salvar/cancelar,
  Escape/retorno de foco, imagem inválida/tamanho/decodificação/prévia/cancelar,
  aplicação de foto e cleanup de URLs; navegação, abas, posts, curtidas, salvos,
  conexões sincronizadas; reset ao recarregar; perfis próprio/público/inexistente.
- Larguras 360, 390, 768, 1024, 1280 e 1440 px, inclusive diálogo: sem overflow.
- Login, Cadastro e redirect `/` verificados; sem erros de página ou requests
  de API/POST/PATCH/DELETE, localStorage e sessionStorage vazios no teste isolado.
- Screenshots e scripts temporários de verificação ficam fora do repositório.

Melhorias futuras: integrar contratos confirmados, autorização real no backend,
paginação de posts e gerenciamento real de conexões; recorte opcional de avatar
pode ser acrescentado depois, sem alterar este fluxo de edição.

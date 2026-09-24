# Validação da feature 001 em LocalLabs

## Contrato pós-merge (revisão em andamento)

- O checklist e a implementação atualizada estão em
  `ModulosTestesAutomatizados/.github/openspec/changes/corrigir-versionamento-pos-merge/`.
- O conjunto original de 10 testes pertence ao contrato antigo de prévia
  SemVer obrigatória; o código foi preservado em `versioning.legacy.mjs` e
  não deve ser usado como evidência da nova versão.
- Suíte nova `npm test`: checks contextuais de PR, dois perfis Node com PR
  pós-merge/tag no SHA versionado, dez reexecuções, recuperação de release
  ausente e conflito simulado; `npm run test:ts` compila/testa consumidor.
- `standard-version@9.5.0` e `@changesets/cli@2.29.5` foram executados de
  verdade em repositórios temporários: nenhum criou tag ou commit na fase de
  preparação. O Changesets exigiu sincronização adicional do
  `package-lock.json` do workspace após `changeset version`.
- Go 1.27 e `go-gitsemver` na revisão fixada calcularam localmente `1.0.0`
  para a branch `master` antes da ativação da publicação. O teste Java/Spring
  Boot depende do runner com Java 17/Maven ou de toolchain local equivalente.

### Matriz de evidências hospedadas (preencher durante as rodadas)

| Rodada | Milestone/épica | PRs feature → release → develop → master | Check/CI e homologação | SHA funcional | PR de versão/SHA | Tag/Release | Reexecução e conflito |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `standard-version` | pendente | pendente | pendente | pendente | pendente | pendente | pendente |
| `changesets` | pendente | pendente | pendente | pendente | pendente | pendente | pendente |
| `jgitver` | pendente | pendente | pendente | pendente | não se aplica se derivado de Git | pendente | pendente |
| `go-gitsemver` | pendente | pendente | pendente | pendente | não se aplica se derivado de Git | pendente | pendente |

Sem URLs/SHA e aprovação real preenchidos nessa tabela, a publicação hospedada
e seus gates continuam **não validados**.

## Verificações locais

- `npm test`: **10/10 cenários passaram** em repositórios Git temporários:
  prévia sem tag, quatro perfis simulados, PR inválido, bloqueio pré-merge,
  milestone/review pendentes, recuperação após falha parcial, idempotência
  (dez reexecuções), tag divergente e concorrência.
- `bash tests/versioning/validate-contract.sh`: valida parsing YAML e
  permissões/contrato de prévia e publicação.
- `bash -n scripts/versioning/*.sh` no clone `.github`: verifica sintaxe shell.
- `actionlint v1.7.12`: sem achados após ignorar somente os dois campos
  `job.workflow_repository`/`job.workflow_sha` que essa versão do linter ainda
  não reconhece; o suporte deles consta na documentação atual do GitHub Actions.
- `npm audit --audit-level=high`: nenhuma vulnerabilidade reportada.
- Ferramentas reais: `standard-version --dry-run` calculou versão no workspace
  Node sem alterar arquivos; `changeset status --output` calculou `1.0.1`
  para `@locallabs/changesets-example`; `go-gitsemver --path
  examples/go-gitsemver --show-variable SemVer` calculou `1.0.0` após
  instalação pela revisão fixada. Maven/jgitver real não foi executado:
  não há Java/JAVA_HOME configurado neste host; o workflow prepara Java 17.

## Validação hospedada pendente

- O caller do LocalLabs **não** está ativo em `.github/workflows/`, pois a ref
  estável `@v1` do repositório compartilhado ainda não foi publicada.
- A execução real dos quatro adaptadores, review/homologação via GitHub e
  publicação com credenciais reais requerem branches, milestone fechada,
  ambiente protegido e merge aprovado no LocalLabs.
- A ausência dessa etapa significa que critérios de tempo e cenários de
  integração hospedada ainda não foram medidos. Não atribuir aprovação de
  produção somente aos testes locais.

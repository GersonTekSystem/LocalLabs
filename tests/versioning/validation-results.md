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
- Go 1.27 e `go-gitsemver` na revisão fixada calcularam `0.0.1` para o SHA
  `0bee03a4c5d8e635b75a5201014a8626db072d7e` com a configuração nativa
  de bootstrap; `Sha` do JSON correspondeu ao commit analisado. O teste Java/Spring
  Boot depende do runner com Java 17/Maven ou de toolchain local equivalente.
- A revisão compartilhada Go `ce1ad6bcaba9a27d86101984d6ef348c5dd0d583`
  existe remotamente; `SHARED_VERSIONING_SHA` aponta para ela no LocalLabs.
- [CI hospedada do PR de preparação #1](https://github.com/GersonTekSystem/LocalLabs/actions/runs/36074238666)
  (reexecução 2): `shared-contract`, Node/TypeScript, Go e Spring Boot/Maven
  passaram. O jgitver calculou `0.0.0` na branch de ensaio com a configuração
  estável; falta observá-lo após integração efetiva em `master`.
- [CI atualizada do PR #1](https://github.com/GersonTekSystem/LocalLabs/actions/runs/36139171499):
  Node, Go reutilizável (teste/análise/build), Java e contrato compartilhado
  passaram. O contrato foi reexecutado após atualizar a variável para a revisão
  Go. O [PR #1](https://github.com/GersonTekSystem/LocalLabs/pull/1) foi
  aprovado por `GersonTekSystem` e integrado por `agentegersonfribeiro-AI`
  no SHA `1711dbdd762bf5b611230670b5dec602e896ba27`, ainda sem publicação.
- `release/v1.0.0` foi sincronizada com esse SHA. `release/v1.0.0`, `develop`
  e `master` exigem `consumer-go / verify-go`,
  `validate-go-gitsemver / preview` e uma revisão humana vigente, inclusive
  após novo push. O environment `homologation` aceita só `master` e exige
  aprovação de `GersonTekSystem` com autoaprovação impedida.

### Matriz de evidências hospedadas (preencher durante as rodadas)

| Rodada | Milestone/épica | PRs feature → release → develop → master | Check/CI e homologação | SHA funcional | PR de versão/SHA | Tag/Release | Reexecução e conflito |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `standard-version` | pendente | pendente | pendente | pendente | pendente | pendente | pendente |
| `changesets` | pendente | pendente | pendente | pendente | pendente | pendente | pendente |
| `jgitver` | pendente | pendente | pendente | pendente | não se aplica se derivado de Git | pendente | pendente |
| `go-gitsemver` | `v1.0.0` / épica [#3](https://github.com/GersonTekSystem/LocalLabs/issues/3), sub-issue [#4](https://github.com/GersonTekSystem/LocalLabs/issues/4) | [preparação #1](https://github.com/GersonTekSystem/LocalLabs/pull/1) integrada; [feature/caller #5](https://github.com/GersonTekSystem/LocalLabs/pull/5) em revisão; demais pendentes | [CI de preparação](https://github.com/GersonTekSystem/LocalLabs/actions/runs/36139171499); aprovação do PR #1 registrada; homologação pendente | pendente | não se aplica | pendente | pendente |

Sem URLs/SHA e aprovação real preenchidos nessa tabela, a publicação hospedada
e seus gates continuam **não validados**.

## Verificações locais

- No compartilhado, testes de PR e pós-merge simulados passaram; o teste com
  `go-gitsemver` real cobre bootstrap, `fix`, `feat`, quebra de compatibilidade,
  múltiplas entregas e configuração inválida. No LocalLabs, `go test ./...`,
  `go vet ./...` e `go build ./...` passaram localmente.
- `bash tests/versioning/validate-contract.sh`: valida parsing YAML e
  permissões/contrato de prévia e publicação.
- `bash -n scripts/versioning/*.sh` no clone `.github`: verifica sintaxe shell.
- `actionlint v1.7.12`: sem achados após ignorar somente os dois campos
  `job.workflow_repository`/`job.workflow_sha` que essa versão do linter ainda
  não reconhece; o suporte deles consta na documentação atual do GitHub Actions.
- `npm audit --audit-level=high`: nenhuma vulnerabilidade reportada.
- Ensaios anteriores: `standard-version --dry-run` calculou versão no workspace
  Node sem alterar arquivos; `changeset status --output` calculou `1.0.1`
  para `@locallabs/changesets-example`; `go-gitsemver --path
  examples/go-gitsemver --show-variable SemVer` calculou `1.0.0` **antes** da
  configuração de bootstrap. Maven/jgitver real não foi executado localmente:
  não há Java/JAVA_HOME configurado neste host; o workflow prepara Java 17.

## Validação hospedada pendente

- O caller Go já consta no PR #5, mas **ainda não** está em `master`; portanto
  não houve publicação. Faltam os merges revisados do fluxo e a aprovação
  real do environment.
- A primeira execução real será apenas Go. Os demais perfis seguem em
  `jgitver → Changesets/Turbo → standard-version` e não bloqueiam esta rodada.
- A ausência dessa etapa significa que critérios de tempo e cenários de
  integração hospedada ainda não foram medidos. Não atribuir aprovação de
  produção somente aos testes locais.

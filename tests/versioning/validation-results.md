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
- A primeira publicação usou a revisão compartilhada Go
  `ce1ad6bcaba9a27d86101984d6ef348c5dd0d583`. Após a falha da
  reexecução, `SHARED_VERSIONING_SHA` passou a apontar para a correção
  `8b0c6a372ab560400a735bbe42a8a39af823cacf` no LocalLabs.
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

### Matriz de evidências hospedadas

| Rodada | Milestone/épica | PRs feature → release → develop → master | Check/CI e homologação | SHA funcional | PR de versão/SHA | Tag/Release | Reexecução e conflito |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `standard-version` | pendente | pendente | pendente | pendente | pendente | pendente | pendente |
| `changesets` | pendente | pendente | pendente | pendente | pendente | pendente | pendente |
| `jgitver` | pendente | pendente | pendente | pendente | não se aplica se derivado de Git | pendente | pendente |
| `go-gitsemver` | `v1.0.0` / épica [#3](https://github.com/GersonTekSystem/LocalLabs/issues/3), sub-issue [#4](https://github.com/GersonTekSystem/LocalLabs/issues/4) | [preparação #1](https://github.com/GersonTekSystem/LocalLabs/pull/1), [feature/caller #5](https://github.com/GersonTekSystem/LocalLabs/pull/5), [release → develop #6](https://github.com/GersonTekSystem/LocalLabs/pull/6), [develop → master #7](https://github.com/GersonTekSystem/LocalLabs/pull/7); todos integrados | [CI e publicação](https://github.com/GersonTekSystem/LocalLabs/actions/runs/36266024805) aprovadas no environment `homologation` | `db1700045c6e618f539b3de6258e4877ffc85069` | não se aplica | [v0.0.1](https://github.com/GersonTekSystem/LocalLabs/releases/tag/v0.0.1), tag no SHA funcional | tentativa 2 falhou na saída nativa `Sha` vazia; tag/release preservadas; correção central em `8b0c6a372ab560400a735bbe42a8a39af823cacf` |

O bootstrap Go hospedado está comprovado; os demais perfis e os cenários de
reexecução/conflito ainda precisam de evidência própria.

## Publicação Go hospedada em 2026-09-26

- Revisão compartilhada do caller, prévia e scripts:
  `ce1ad6bcaba9a27d86101984d6ef348c5dd0d583`.
- Configuração nativa em `.github/GitVersion.yml`: `mode: Mainline`,
  `base-version: 0.0.0`, `next-version: 0.0.1` e
  `commit-message-incrementing: Disabled` somente para o bootstrap;
  `release` usa `is-release-branch: false`. A milestone `v1.0.0` não
  determina a versão do aplicativo.
- PRs #1, #5, #6 e #7 tiveram revisão humana antes do merge. No PR #7,
  o responsável confirmou a homologação para autorizar o ensaio real; os
  previews passaram após o registro. A CI Go do **mesmo push** para `master`
  executou `go test`, `go vet` e `go build` antes da publicação. O ambiente
  `homologation` exigiu uma segunda aprovação humana.
- [Execução inicial](https://github.com/GersonTekSystem/LocalLabs/actions/runs/36266024805)
  passou. O go-gitsemver na revisão fixa calculou `0.0.1` para o merge
  `db1700045c6e618f539b3de6258e4877ffc85069` e explicou o uso do
  `next-version` temporário. O job registrou `published_sha`.
- A referência remota `refs/tags/v0.0.1` e a
  [GitHub Release v0.0.1](https://github.com/GersonTekSystem/LocalLabs/releases/tag/v0.0.1)
  apontam para o mesmo SHA integrado. Nenhum PR artificial de versão nem
  `versioning_token` foi necessário para Go.
- A [tentativa 2 da mesma execução](https://github.com/GersonTekSystem/LocalLabs/actions/runs/36266024805/attempts/2)
  recebeu nova aprovação do environment, mas falhou antes da consulta à tag:
  o go-gitsemver nativo devolveu `Sha` vazio para o commit já tagueado. A
  release inicial ficou intacta. A correção central
  `8b0c6a372ab560400a735bbe42a8a39af823cacf` exige que a tag da versão
  calculada aponte para o SHA esperado nesse caso; o teste com o binário real
  reproduziu a falha antes da correção e passou depois.

## Segunda rodada Go preparada

- A milestone `v1.0.1`, a [épica #8](https://github.com/GersonTekSystem/LocalLabs/issues/8)
  e a [sub-issue #9](https://github.com/GersonTekSystem/LocalLabs/issues/9)
  existem somente no LocalLabs. A branch protegida `release/v1.0.1` parte do
  `master` que publicou `v0.0.1`.
- O caller e o preview Go usarão o mesmo SHA compartilhado corrigido. As
  opções temporárias `next-version` e `commit-message-incrementing` serão
  removidas e uma correção funcional `fix:` deverá produzir o próximo
  incremento nativo. A execução hospedada e o resultado permanecem pendentes.

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

## Validação hospedada ainda pendente

- Cada tentativa hospedada de reexecução requer aprovação independente do
  environment. Ainda faltam dez reexecuções sem incremento, reexecução antiga após versão
  posterior, concorrência, recuperação após tag sem release e conflito sem
  mover a tag.
- Remover os dois controles temporários de bootstrap e comprovar incremento
  por Conventional Commits numa segunda rodada.
- Os demais perfis seguem em `jgitver → Changesets/Turbo → standard-version`
  e não bloqueiam a liberação inicial Go.

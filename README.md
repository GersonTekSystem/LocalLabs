# LocalLabs

Laboratório descartável para validar workflows compartilhados em projetos
consumidores. A branch principal deste repositório é **`master`**.

## Quatro perfis de versionamento

| Adaptador | Exemplo | CI do consumidor | Publicação esperada |
| --- | --- | --- | --- |
| `standard-version` | `examples/standard-version` | TypeScript: compilação e teste | PR de versão após merge funcional; tag `vX.Y.Z` no commit versionado |
| `changesets` | `examples/changesets` | instalação/contrato Node | PR de versão; tag `@locallabs/changesets-example@X.Y.Z` |
| `jgitver` | `examples/jgitver` | Spring Boot: Maven `verify` com Java 17 | versão derivada do Git no SHA integrado |
| `go-gitsemver` | `examples/go-gitsemver` | CI Go reutilizável: teste, análise e build | versão derivada do Git no SHA integrado |

O workflow em `.github/workflows/consumer-ci.yml` testa build/execução do
consumidor. Os scripts de versionamento vivem no repositório `.github`, não
são copiados para cada perfil. Para rodar os testes locais do contrato:

```bash
npm ci
npm run test:ts
SHARED_REPO="C:/caminho/para/.github" npm test
SHARED_REPO="C:/caminho/para/.github" bash tests/versioning/validate-contract.sh
(cd examples/go-gitsemver && go test ./...)
```

Para Java, em `examples/jgitver`, execute `mvn -B -ntp verify` com Java 17;
o runner hospedado executa esse comando. A prévia de PR não instala Maven ou
Go: esses builds são responsabilidade da CI do consumidor.

## Preparação dos ensaios hospedados

1. Publicar uma revisão fixa revisada dos workflows compartilhados (SHA de
   commit ou tag efetivamente criada) e definir a variável de repositório
   `SHARED_VERSIONING_SHA` para o job de contrato. Substituir o placeholder do
   [caller modelo](tests/versioning/fixtures/caller.yml) pela mesma revisão.
2. Criar `develop` e uma `release/vX.Y.Z` a partir dela para cada rodada;
   criar milestone `vX.Y.Z`, épica de mesmo título e sub-issues da sprint.
   `vX.Y.Z` da milestone **não** é a versão obrigatória da aplicação.
   Encerrar épica e milestone após a homologação breve e antes do PR
   `release → develop`; a homologação completa ocorre antes de `develop → master`.
3. Configurar em `master` os checks de `.github/workflows/version-validation.yml`
   e de `CI do consumidor` relevantes, revisão humana e environment
   `homologation` com aprovação. O workflow ativo tem **somente checks de PR**
   para os quatro perfis; o job `publish` permanece apenas no modelo inativo.
   Ensaiar feature → release, release → develop e develop → master, inclusive
   falhas por vínculo/homologação ausente.
4. Depois de comprovar os checks de PR, habilitar primeiro **somente Go**.
   Para os perfis Node posteriores, providenciar `VERSIONING_TOKEN` (GitHub App
   ou identidade que abra PR e dispare checks), revisar e integrar o PR de
   versionamento antes da tag. Para Go e Java, conferir versão estável derivada
   do Git no SHA integrado. Nunca disputar a mesma tag para dois perfis.
5. Registrar em [validation-results.md](tests/versioning/validation-results.md)
   URLs de PRs/checks, aprovação do ambiente, versão/tag/SHA, reexecuções,
   falha parcial e conflito. Usar quatro rodadas/commits/milestones distintos
   e ajustar a versão candidata quando colidir com tag preexistente.

O teste de `standard-version` deve reunir mais de um PR na mesma release sem
tag intermediária. A homologação pode anexar um guia provisório sem exigir
prévia SemVer, e arquivos de versão/changelog só são alterados **após** o merge
funcional na principal. Veja o [contrato compartilhado](https://github.com/ModulosTestesAutomatizados/.github/blob/feature/issue-2/docs/versioning.md)
para saídas, permissões e recuperação. O arquivo
`tests/versioning/fixtures/caller.yml` é um modelo inativo: a publicação só será
ativada após configurar review obrigatório e o environment protegido.

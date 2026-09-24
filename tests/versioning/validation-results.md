# Validação da feature 001 em LocalLabs

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

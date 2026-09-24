# LocalLabs
Repositório puramente dedicado a realização de testes de pipelines e artefatos semelhantes

## Versionamento por sprint

Os testes em `tests/versioning/` validam offline os workflows reutilizáveis do
repositório `.github`. As implementações mínimas para os quatro adaptadores estão em
`examples/standard-version/`, `examples/changesets/`, `examples/jgitver/` e
`examples/go-gitsemver/`.

```bash
npm ci
SHARED_REPO="C:/caminho/para/.github" npm test
SHARED_REPO="C:/caminho/para/.github" bash tests/versioning/validate-contract.sh
```

Antes de habilitar um caller real, publique a revisão dos workflows compartilhados
sob uma referência estável (por exemplo `v1`), crie milestone/épica e branches de
ensaio, configure review obrigatório e uma environment `homologation` protegida.
O arquivo `tests/versioning/fixtures/caller.yml` mostra a chamada mas não dispara
publicação neste repositório automaticamente. Não execute o teste de publicação
contra a branch principal sem esses gates.

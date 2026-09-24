# Cenários de prévia

- PR de `feature/*` para `release/v1.0.0`, body `Refs #2`, issue #2 na milestone
  v1.0.0, commit `feat: ...`: cada um dos quatro perfis retorna candidato e
  `bump`; não há tag/release nova.
- PR empilhado para `feature/*` ou para `develop`: pode calcular prévia, nunca
  acessa o fluxo de publicação.
- Body sem issue, issue sem milestone ou commit sem Conventional Commit: a
  prévia falha com motivo; nenhum recurso é publicado.
- Após atualização do PR, `head.sha` diferente do checkout antigo: a execução
  antiga não deve aprovar o novo HEAD.

Cobertura local automatizada: `versioning.test.mjs` usa Git em repositório
temporário e GitHub/toolchains simulados para os quatro perfis; o teste de
PR hospedado precisa de branch, milestone e proteção no LocalLabs.

# Cenários de colisão e recuperação

1. Integrar PR aprovado na branch principal com milestone e épica fechadas.
   **Esperado**: tag e release no commit integrado.
2. Reexecutar a mesma operação dez vezes.
   **Esperado**: `already-published` sem segunda release.
3. Disparar dois jobs simultâneos com mesma versão.
   **Esperado**: no máximo uma criação; outro reconcilia, sem force-push.
4. Preparar tag do mesmo nome apontando a SHA diferente.
   **Esperado**: `conflict` e histórico preservado.
5. Simular erro de API depois da criação da tag.
   **Esperado**: novo run cria somente a release que faltava; nunca move tag.

Os testes automatizados usam resposta de API simulada; após publicar a ref
estável, repetir os cenários de forma controlada em LocalLabs antes de habilitar
callers de produção.

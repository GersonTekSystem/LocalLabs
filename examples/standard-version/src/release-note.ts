/** Prepara uma descrição curta para o changelog de homologação. */
export function formatReleaseNote(pMessage: string): string {
  const message = pMessage.trim();
  if (!message) {
    throw new Error('Uma entrega precisa de descrição');
  }
  return `Entrega: ${message}`;
}

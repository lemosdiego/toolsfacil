/*
 * Arquivo escolhido na home, a caminho da ferramenta: fica só na memória da
 * página (variável de módulo), sem cópia, base64 ou sessionStorage. A
 * navegação do Next mantém o módulo vivo; ao recarregar, o arquivo some.
 */

let pendingFile: File | undefined;

/** Guarda o arquivo para a próxima ferramenta aberta (substitui o anterior). */
export function setPendingFile(file: File): void {
  pendingFile = file;
}

/** Entrega o arquivo guardado uma vez só e esvazia o store. */
export function takePendingFile(): File | undefined {
  const file = pendingFile;
  pendingFile = undefined;
  return file;
}

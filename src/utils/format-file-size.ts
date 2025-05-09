/**
 * @description | Formata o tamanho de um arquivo em bytes para uma string legível
 * @param bytes | Tamanho do arquivo em bytes
 * @returns | Retorna uma string com o tamanho do arquivo formatado
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

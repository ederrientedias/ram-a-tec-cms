import { ITab, IFile, IComplianceService } from '@/models/compliance.model';
import ComplianceRepository from '@/repositories/compliance.repository';

class ComplianceService implements IComplianceService {
  /**
   * @description | Obtém as abas que reflettem os arquivos que serão exibidos na tela de compliance
   * @returns {ITab[] | []} | Retorna um array de objetos com as informações das abas
   */
  public async getTabs(): Promise<ITab[] | []> {
    return await ComplianceRepository.getTabs();
  }

  /**
   * @description | Obtém os arquivos de uma coleção específica
   * @param collectionName | Nome da coleção
   * @returns | Retorna um array de objetos com as informações dos arquivos
   */
  public async getFiles(collectionName: string): Promise<IFile[] | []> {
    return await ComplianceRepository.getFiles(collectionName);
  }

  /**
   * @description | Adiciona um arquivo a uma coleção específica
   * @param collectionName | Nome da coleção
   * @param file | Objeto com as informações do arquivo a ser adicionado
   * @returns | Retorna true se o arquivo foi adicionado com sucesso
   */
  public async addFile(collectionName: string, file: IFile): Promise<boolean> {
    const files = await ComplianceRepository.getFiles(collectionName);

    if (Array.isArray(files) && files.length === 0) {
      return await ComplianceRepository.setFiles(collectionName, [file]);
    }

    if (Array.isArray(files) && files.length > 0) {
      const exists = files.some((f: IFile) => f.docId === file.docId);
      const index = files.findIndex((f: IFile) => f.docId === file.docId);

      if (exists && index !== -1) {
        files[index] = file;
        return await ComplianceRepository.setFiles(collectionName, files);
      }

      const mergedFiles = [{ id: files.length, ...file }, ...files];
      return await ComplianceRepository.setFiles(collectionName, mergedFiles);
    }
  }

  /**
   * @description | Deleta um arquivo de uma coleção específica
   * @param collectionName | Nome da coleção
   * @param docId | Id do arquivo a ser deletado
   * @returns | Retorna true se o arquivo foi deletado com sucesso
   */
  public async deleteFile(collectionName: string, docId: string): Promise<boolean> {
    const files = await ComplianceRepository.getFiles(collectionName);

    if (!Array.isArray(files) || files.length === 0) {
      return false;
    }

    if (Array.isArray(files) && files.length > 0) {
      const exists = files.some((f: IFile) => f.docId === docId);
      const index = files.findIndex((f: IFile) => f.docId === docId);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        files.splice(index, 1);
        return await ComplianceRepository.setFiles(collectionName, files);
      }
    }
  }
}
export default new ComplianceService();

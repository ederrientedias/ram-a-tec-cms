import {
  ICollectionMap,
  IDocumentProps,
  IDocumentService,
  IDocumentUpdate,
  IFile,
} from '@/models/documents.model';
import DocumentsRepository from '@/repositories/products/documents.repository';
import { ILandingPageLog } from '@/models/log.model';

class DocumentService implements IDocumentService {
  /**
   * @description | Obtém o mapa de coleções de um fundo
   * @param fundName | Nome do fundo
   * @returns | retorna o mapa de coleções de um fundo
   */
  public async getCollectionsMap(fundName: string): Promise<ICollectionMap[] | []> {
    return await DocumentsRepository.getCollectionsMap(fundName);
  }

  /**
   * @description | Atualiza o mapa de coleções de um fundo
   * @param fundName | Nome do fundo
   * @param collectionMap | Array com o mapa de coleções
   * @returns  | retorna true se o mapa de coleções foi atualizado com sucesso
   */
  public async updateCollectionsMap(
    fundName: string,
    collectionMap: ICollectionMap[]
  ): Promise<boolean> {
    return await DocumentsRepository.updateCollectionsMap(fundName, collectionMap);
  }

  /**
   * @description | Obtém os arquivos de um fundo especifico
   * @param documentProps | Propriedades para realizar a consulta
   * @returns | Retorna um array com os arquivos
   */
  public async getFiles(documentProps: Partial<IDocumentProps>): Promise<IFile[] | []> {
    return await DocumentsRepository.getFiles(documentProps);
  }

  /**
   * @description | Atualiza a coleção de arquivos com o novo arquivo
   * @param documentProps | Propriedades para ataulizar os arquivos
   * @returns | retorna true se os arquivos foram atualizados com sucesso
   */
  public async updateFile(documentProps: IDocumentUpdate): Promise<boolean> {
    try {
      const filesRef = await this.getFiles(documentProps);
      let filesToSave: IFile[] | [] = [];

      if (!filesRef || filesRef.length === 0) {
        filesToSave = [documentProps.file];
      } else {
        filesToSave = this.handleFile(filesRef, documentProps.file);
      }

      await DocumentsRepository.setFiles({
        ...documentProps,
        files: filesToSave,
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * @description | Deleta um arquivo
   * @param props | Propriedades para deletar um arquivo
   * @returns     | retorna true se o arquivo for deletado
   */
  public async deleteFile(props: ILandingPageLog): Promise<boolean> {
    const documentProps = {
      fundName: props.fundRef,
      collectionName: props.collectionName,
      year: props.fileYear,
    };
    const files = await this.getFiles(documentProps);
    const exists = files.some((f: IFile) => f.docId === props.docId);
    const index = files.findIndex((f: IFile) => f.docId === props.docId);

    if (!exists && index === -1) {
      return false;
    }

    if (exists && index !== -1) {
      files.splice(index, 1);

      return await DocumentsRepository.setFiles({
        ...documentProps,
        files: files,
      });
    }
  }

  /**
   * @description | Valida o arquivo e retorna o array de arquivos
   * @param files | Array de arquivos
   * @param file  |  Arquivo para validar
   * @returns     | Retorna o array de arquivos
   */
  private handleFile(files: IFile[], file: IFile): IFile[] {
    const index = files.findIndex((item) => item.mes === file.mes && item.name === file.name);

    if (index !== -1) {
      files[index] = file;
      return files;
    }

    return (files = [...files, file]);
  }
}
export default new DocumentService();

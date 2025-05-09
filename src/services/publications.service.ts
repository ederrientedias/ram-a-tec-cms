import { IPublication, IPublicationService } from '@/models/publication.model';
import publicationRepository from '@/repositories/publication.repository';

class PublicationsService implements IPublicationService {
  /**
   * @description | Obtém todas as publicações
   * @returns | Promise<IPublication[]> - Array de publicações
   */
  public async getPublications(): Promise<IPublication[]> {
    return await publicationRepository.get();
  }

  /**
   * @description | Salva a nova publicação
   * @param newPublication | Nova publicação
   * @returns | true se salvou com sucesso
   */
  public async setPublications(newPublication: IPublication): Promise<boolean> {
    const publications = await this.mergePublications(newPublication);

    return await publicationRepository.set(publications);
  }

  /**
   * @description | Mescla a nova publicação com as publicações existentes
   * @param newPublication | Nova publicação
   * @returns | Array de publicações
   */
  private async mergePublications(newPublication: IPublication): Promise<IPublication[]> {
    const publications = await this.getPublications();
    const mergedPublication = [...publications, { ...newPublication, id: publications.length + 1 }];

    return mergedPublication;
  }
}

export default new PublicationsService();

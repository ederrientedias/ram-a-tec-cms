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
    const publications = await this.handlePublications(newPublication);

    return await publicationRepository.set(publications);
  }

  /**
   * @description | Deleta a publicação
   * @param id | Id da publicação a ser deletada
   * @returns | true se deletou com sucesso
   */
  public async deletePublication(id: string): Promise<boolean> {
    const publications = await this.getPublications();
    const filteredPublications = publications.filter((p: IPublication) => p.id !== id);
    return await publicationRepository.set(filteredPublications);
  }

  /**
   * @description | Mescla a nova publicação com as publicações existentes
   * @param newPublication | Nova publicação
   * @returns | Array de publicações
   */
  private async handlePublications(newPublication: IPublication): Promise<IPublication[]> {
    const publications = await this.getPublications();
    const publicationIndex = publications.findIndex(
      (p: IPublication) => p.id === newPublication.id
    );

    if (publicationIndex !== -1) {
      publications[publicationIndex] = newPublication;
      return publications;
    }

    const mergedPublication = [...publications, newPublication];
    return mergedPublication;
  }
}

export default new PublicationsService();

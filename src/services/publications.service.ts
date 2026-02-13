import { IMediaOutlet, IPublication, IPublicationService, IType } from '@/models/publication.model';
import publicationRepository from '@/repositories/publication.repository';


class PublicationsService implements IPublicationService {
  public async getPublications(): Promise<IPublication[]> {
    return await publicationRepository.get();
  }

  public async getMediaOutlet(): Promise<IMediaOutlet[]> {
    return await publicationRepository.getMediaOutlet();
  }

  public async getTypes(): Promise<IType[]> {
    return await publicationRepository.getTypes();
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

  public async setMediaOutlet(data: IMediaOutlet): Promise<boolean> {
    const response = await publicationRepository.getMediaOutlet();

    const index = response.findIndex((f) => f.id === data.id);

    const props = {
      collectionRef: 'media_outlet',
      subDocRef: 'companies',
      data:
        index === -1 ? [...response, data] : response.map((item, i) => (i === index ? data : item)),
    };

    return await publicationRepository.setDocument(props);
  }
  public async setType(data: IType): Promise<boolean> {
    const response = await publicationRepository.getTypes();

    const index = response.findIndex((f: IType) => f.id === data.id);

    const props = {
      collectionRef: 'media_outlet',
      subDocRef: 'types',
      data:
        index === -1 ? [...response, data] : response.map((item, i) => (i === index ? data : item)),
    };

    return await publicationRepository.setDocument(props);
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

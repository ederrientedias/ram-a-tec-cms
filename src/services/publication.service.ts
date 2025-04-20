import { IPublication } from '@/models/publication.model';
import publicationRepository from '@/repositories/publication.repository';

class PublicationService {
  public async getPublications(): Promise<IPublication[]> {
    return await publicationRepository.get();
  }

  public async setPublications(newPublication: IPublication): Promise<boolean> {
    const publications = await this.mergePublications(newPublication);

    return await publicationRepository.set(publications);
  }

  private async mergePublications(newPublication: IPublication): Promise<IPublication[]> {
    const publications = await this.getPublications();
    const mergedPublication = [...publications, { ...newPublication, id: publications.length + 1 }];

    return mergedPublication;
  }
}

export default new PublicationService();

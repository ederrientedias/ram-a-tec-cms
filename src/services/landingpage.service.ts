import { ICollectionMap, IDocumentProps, IFileMetadata } from '@/models/landingpage.model';
import LandingPageRepository from '@/repositories/landingpage.repository';
import fundsRepository from '@/repositories/funds.repository';
import { IFund } from '@/models/funds.model';


class LandingPageService {
  public async getAllLandingPages(): Promise<IFund[]> {
    const response = await fundsRepository.getAllFunds();
    return response
      .filter((item: IFund) => !item.displayInFundList)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  public async getCollectionMap(fundName: string): Promise<any> {
    const response = await LandingPageRepository.getCollectionMap(fundName);
    if (!response || response.length === 0) return [];
    return response.sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
  }

  public async getFiles(props: IDocumentProps): Promise<any> {
    const files = await LandingPageRepository.getDocuments(props);
    if (files.length === 0) return [];
    return files.sort((a: any, b: any) => a.id - b.id);
  }

  public async setFile(props: IDocumentProps, file: IFileMetadata): Promise<boolean> {
    const files = await LandingPageRepository.getDocuments(props);

    if (Array.isArray(files) && files.length === 0) {
      return await LandingPageRepository.setDocuments(props, [file]);
    }

    if (Array.isArray(files) && files.length > 0) {
      const exists = files.some((f: IFileMetadata) => f.id === file.id);
      const index = files.findIndex((f: IFileMetadata) => f.id === file.id);

      if (exists && index !== -1) {
        files[index] = file;
        return await LandingPageRepository.setDocuments(props, files);
      }

      const mergedFiles = [...files, file];
      return await LandingPageRepository.setDocuments(props, mergedFiles);
    }
  }

  public async setCollectionMap(
    collectionName: string,
    collectionMapMetadata: ICollectionMap
  ): Promise<any> {
    const collections = await LandingPageRepository.getCollectionMap(collectionName);

    if (!collections || collections.length === 0) {
      return await LandingPageRepository.setCollectionMap(collectionName, [collectionMapMetadata]);
    }

    if (Array.isArray(collections) && collections.length > 0) {
      const exists = collections.some((f: ICollectionMap) => f.id === collectionMapMetadata.id);
      const index = collections.findIndex((f: ICollectionMap) => f.id === collectionMapMetadata.id);

      if (exists && index !== -1) {
        collections[index] = collectionMapMetadata;
        return await LandingPageRepository.setCollectionMap(collectionName, collections);
      }

      const mergedCollections = [...collections, collectionMapMetadata];
      return await LandingPageRepository.setCollectionMap(collectionName, mergedCollections);
    }
  }

  public async deleteFile(props: IDocumentProps, file: IFileMetadata): Promise<boolean> {
    const files = await LandingPageRepository.getDocuments(props);

    if (!Array.isArray(files) || files.length === 0) {
      return false;
    }

    if (Array.isArray(files) && files.length > 0) {
      const exists = files.some((f: IFileMetadata) => f.id === file.id && f.name === file.name);
      const index = files.findIndex((f: IFileMetadata) => f.id === file.id && f.name === file.name);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        files.splice(index, 1);
        return await LandingPageRepository.setDocuments(props, files);
      }
    }
  }

  public async deleteCollectionMap(
    collectionName: string,
    collectionMap: ICollectionMap
  ): Promise<boolean> {
    const collections = await LandingPageRepository.getCollectionMap(collectionName);

    if (!Array.isArray(collections) || collections.length === 0) {
      return false;
    }

    if (Array.isArray(collections) && collections.length > 0) {
      const exists = collections.some(
        (c: ICollectionMap) =>
          c.id === collectionMap.id && c.collectionName === collectionMap.collectionName
      );
      const index = collections.findIndex(
        (c: ICollectionMap) =>
          c.id === collectionMap.id && c.collectionName === collectionMap.collectionName
      );

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        collections.splice(index, 1);
        return await LandingPageRepository.setCollectionMap(collectionName, collections);
      }
    }
  }
}
export default new LandingPageService();

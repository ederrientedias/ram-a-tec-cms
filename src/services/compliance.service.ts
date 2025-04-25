import { CollectionName, ITab, IFile, IUploadRef } from '@/models/compliance.model';
import ComplianceRepository from '@/repositories/compliance.repository';

class ComplianceService {
  public async getTabs(): Promise<ITab[] | []> {
    return await ComplianceRepository.getTabs();
  }

  public async getLastUploadsRef(): Promise<IUploadRef[] | []> {
    return await ComplianceRepository.getLastUploadsRef();
  }

  public async getFiles(collectionName: string): Promise<IFile[] | []> {
    return await ComplianceRepository.getFiles(collectionName);
  }

  public async updateUploadsRef(uploadRef: IUploadRef): Promise<boolean> {
    const uploadsRef = await ComplianceRepository.getLastUploadsRef();
    const mergedUploadsRef = [{ id: uploadsRef.length + 1, ...uploadRef }, ...uploadsRef];
    return await ComplianceRepository.setUploadsRef(mergedUploadsRef);
  }

  public async updateFiles(collectionName: string, file: IFile): Promise<boolean> {
    const files = await ComplianceRepository.getFiles(collectionName);
    const mergedFiles = [{ id: files.length + 1, ...file }, ...files];
    return await ComplianceRepository.setFiles(collectionName, mergedFiles);
  }
}
export default new ComplianceService();

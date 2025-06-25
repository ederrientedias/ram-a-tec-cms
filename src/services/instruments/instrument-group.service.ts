import InstrumentGroupRepository from '@/repositories/instrument/instrument-group.repository';
import instrumentGroupRepository from '@/repositories/instrument/instrument-group.repository';
import { IGroup, IInstrumentGroup } from '@/models/instruments.model';

class InstrumentService {
  public async getDocRef(): Promise<any> {
    return;
  }

  public async getGroups(): Promise<IGroup[] | []> {
    const document = await InstrumentGroupRepository.getAllGroups();
    return document as IGroup[];
  }

  public async getInstrumentGroup(): Promise<IInstrumentGroup[] | []> {
    const document = await InstrumentGroupRepository.getAllInstrumentGroup();
    const data = Object.values(document)
      .map((group: IInstrumentGroup) => group as IInstrumentGroup)
      .sort((a: IInstrumentGroup, b: IInstrumentGroup) => a.group.localeCompare(b.group));
    return data as IInstrumentGroup[];
  }

  public async createInstrumentGroup(data: IInstrumentGroup): Promise<boolean> {
    // const isInstrumentGroup = await this.instrumentGroupExists(data.idName);

    // if (!isInstrumentGroup) {
    //   console.error('Grupo de instrumentos já existe com o idName:', data.idName);
    //   return false;
    // }

    return await InstrumentGroupRepository.creatInstrumentGroup(data);
  }

  public async updateInstrumentGroup(data: IInstrumentGroup): Promise<boolean> {
    return await InstrumentGroupRepository.updateInstrumentGroup(data);
  }

  public async deleteInstrumentGroup(idName: string): Promise<boolean> {
    return await instrumentGroupRepository.deleteInstrumentGroup(idName);
  }

  private async instrumentGroupExists(idName: string): Promise<boolean> {
    const instrumentGroups = await this.getInstrumentGroup();
    const isGroup = instrumentGroups.findIndex((g: IInstrumentGroup) => g.idName === idName);
    return isGroup !== -1 ? false : true;
  }
}
export default new InstrumentService();

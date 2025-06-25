import InstrumentRepository from '@/repositories/instrument/instrument.repository';
import { DocumentData, DocumentReference } from 'firebase/firestore';
import { IInstrument } from '@/models/instruments.model';

class InstrumentService {
  /**
   * @description Busca a referência do documento
   * @returns Retorna a referência do documento
   */
  public async getDocRef(): Promise<DocumentReference> {
    return InstrumentRepository.getDocRef();
  }

  /**
   * @description Busca todos os instrumentos no Firestore.
   * @returns - Retorna uma lista de instrumentos ou um array vazio se nenhum instrumento for encontrado.
   */
  public async getAllInstruments(): Promise<IInstrument[]> {
    const instrumentsRef = await InstrumentRepository.getAllInstruments();
    if (!instrumentsRef) return [];
    const instruments = Object.values(instrumentsRef)
      .map((instrument: IInstrument) => instrument as IInstrument)
      .sort((a: IInstrument, b: IInstrument) => a.name.localeCompare(b.name));
    return instruments as IInstrument[];
  }

  /**
   * @description Cria um novo instrumento no Firestore.
   * @param instrument | IInstrument
   * @returns - Retorna true se a criação for bem-sucedida, caso contrário, false.
   */
  public async createInstrument(instrument: IInstrument): Promise<boolean> {
    return await InstrumentRepository.createInstrument(instrument);
  }

  /**
   * @description - Deleta um instrumento existente no Firestore.
   * @param idName - O idName do instrumento a ser excluído.
   * @returns - Retorna true se a exclusão for bem-sucedida, caso contrário, false.
   */
  public async deleteInstrument(idName: string): Promise<boolean> {
    return await InstrumentRepository.deleteInstrument(idName);
  }
}
export default new InstrumentService();

import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { FirestoreCollection } from '@/enums/firestore';

export interface ILog {
  id: number;
  fundName: string;
  tabName: string;
  fileName: string;
  fileType: string;
  fileMonth: string;
  fileYear: string;
  collectionName: string;
  fundRef: string;
  createAt: number;
}

class LogsRepository {
  /**
   * @description | Obtém os logs de um documento específico
   * @param logName | Nome do documento de logs
   * @returns | Retorna os logs do documento
   */
  public async getLogs<T>(logName: string): Promise<T | []> {
    const collectionRef = collection(firestoreSite, FirestoreCollection.LOGS);
    const docRef = doc(collectionRef, logName);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    const { data } = docSnap.data();
    return data;
  }

  /**
   * @description |Atualiza os logs de um documento específico
   * @param logName | Nome do documento de logs
   * @param logs | Logs a serem atualizados
   * @returns | Retorna true se os logs foram atualizados com sucesso
   */
  public async updateLogs<T>(logName: string, logs: T[]): Promise<boolean> {
    try {
      const collectionRef = collection(firestoreSite, FirestoreCollection.LOGS);
      const docRef = doc(collectionRef, logName);
      await setDoc(docRef, { data: logs }, { merge: true });
      return true;
    } catch (error) {
      return false;
    }
  }
}
export default new LogsRepository();

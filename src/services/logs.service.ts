import { IComplianceLog, ILandingPageLog, ILogService } from '@/models/log.model';
import LogsRepository from '@/repositories/logs/logs.repository';

export class LogService implements ILogService {
  private logsRepository: typeof LogsRepository;

  constructor() {
    this.logsRepository = LogsRepository;
  }

  /**
   * @description | Obtém os logs de um documento específico
   * @param logName | Nome do documento de logs
   * @returns | Retorna os logs do documento
   */
  public async getLogs<T>(logName: string): Promise<T[] | []> {
    const logs = await this.logsRepository.getLogs<T[]>(logName);
    return logs;
  }

  /**
   * @description | Adiciona um log no documento de logs
   * @param logName | Nome do documento de logs
   * @param logRef | Referencia do log
   * @returns | Retorna true se o log foi adicionado com sucesso
   */
  public async addLog<T>(logName: string, logRef: T): Promise<boolean> {
    let updatedLogs: T[];
    let index: number;
    const logs = await this.logsRepository.getLogs<any>(logName);

    if (Array.isArray(logs) && logs.length === 0) {
      return await this.logsRepository.updateLogs<T>(logName, [logRef]);
    }

    if (Object.prototype.hasOwnProperty.call(logRef, 'docId')) {
      index = logs.findIndex((log: any) => log.docId === logRef['docId']);
    }

    if (Array.isArray(logs) && logs.length > 0) {
      if (index !== -1) {
        updatedLogs = [...logs];
        updatedLogs[index] = logRef;
        return await this.logsRepository.updateLogs(logName, updatedLogs);
      }

      updatedLogs = [logRef, ...logs];

      return await this.logsRepository.updateLogs(logName, updatedLogs);
    }
  }

  /**
   * @description | Deleta um log do documento de logs
   * @param logName | Nome do documento de logs
   * @param id | Id do log a ser deletado
   * @returns | Retorna true se o log foi deletado com sucesso
   */
  public async deleteLog(logName: string, docId: string): Promise<boolean> {
    const logs = await this.logsRepository.getLogs(logName);

    if (!Array.isArray(logs)) {
      return false;
    }

    if (Array.isArray(logs) && logs.length > 0) {
      const exists = logs.some((log) => log.docId === docId);
      const index = logs.findIndex((log) => log.docId === docId);

      if (exists && index !== -1) {
        logs.splice(index, 1);
        return await this.logsRepository.updateLogs(logName, logs);
      }
    }
  }
}
export default new LogService();

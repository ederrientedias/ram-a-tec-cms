import LogsRepository, { ILog } from '@/repositories/logs/logs.repository';

export class LogService {
  private logsRepository: typeof LogsRepository;

  constructor() {
    this.logsRepository = LogsRepository;
  }

  /**
   * @description | Adiciona um log no documento de logs
   * @param logName | Nome do documento de logs
   * @param logRef | Referencia do log
   * @returns | Retorna true se o log foi adicionado com sucesso
   */
  async addLog(logName: string, logRef: ILog): Promise<boolean> {
    console.log('LOG:', logName, '|', logRef);
    const logs = await this.logsRepository.getLogsRef(logName);

    if (Array.isArray(logs) && logs.length === 0) {
      return await this.logsRepository.setLogsRef(logName, [logRef]);
    }

    if (Array.isArray(logs) && logs.length > 0) {
      const logsRef = [logRef, ...logs];
      return await this.logsRepository.setLogsRef(logName, logsRef);
    }
  }

  /**
   * @description | Deleta um log do documento de logs
   * @param logName | Nome do documento de logs
   * @param id | Id do log a ser deletado
   * @returns | Retorna true se o log foi deletado com sucesso
   */
  async deleteLog(logName: string, id: number): Promise<boolean> {
    const logs = await this.logsRepository.getLogsRef(logName);
    const newLogs = logs.filter((log: ILog) => log.id !== id);
    return await this.logsRepository.setLogsRef(logName, newLogs);
  }
}
export default new LogService();

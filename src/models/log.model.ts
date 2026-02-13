export interface ILogRepository {
  getLogs<T>(logName: string): Promise<T[] | []>;
  updateLogs<T>(logName: string, logs: T[]): Promise<boolean>;
}

export interface ILogService {
  getLogs<T>(logName: string): Promise<T[] | []>;
  addLog<T>(logName: string, logRef: T): Promise<boolean>;
  deleteLog(logName: string, id: string): Promise<boolean>;
}

export interface ILandingPageLog {
  id: number;
  fundName: string;
  tabName: string;
  fileName: string;
  fileType: string;
  fileMonth: string;
  fileYear: string;
  collectionName: string;
  fundRef: string;
  docId: string;
  createdAt: number;
}

export interface IComplianceLog {
  id: number;
  company: string;
  collectionRef: string;
  bucketName: string;
  docId: string;
  docName: string;
  docType: string;
  docSize: string;
  createdAt: number;
}

export interface IPortfolioLog {
  id: string;
  fundName: string;
  fileName: string;
  fileSize: string;
  collectionName: string;
  createdAt: number;
}

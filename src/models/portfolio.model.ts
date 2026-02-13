export interface IPortfolioRepository {
  saveAssetsTable: (fundName: string, data: ITable) => Promise<boolean>;
}

export interface IPortfolioService {
  updateAssetTable: (fundName: string, data: ITable) => Promise<boolean>;
}

export interface ITable {
  headers: string[];
  rows: { [key: string]: string }[];
}

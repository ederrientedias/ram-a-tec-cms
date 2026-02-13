export interface IFundsRepository {
  get: () => Promise<IFund[]>;
  set: (funds: IFund[]) => Promise<boolean>;
}

export interface IFundsService {
  getFunds: () => Promise<IFund[]>;
  getFundById: (id: string | number) => Promise<IFund | null>;
  getUniqueValues: <T extends keyof IFund>(propertyName: T) => Promise<IGenericType[]>;
  setFunds: (newFund: IFund) => Promise<boolean>;
}

export interface IFund {
  uuid?: string;
  id: number;
  redirectUrl: string;
  type: string;
  benchmark: string;
  isClosed: boolean;
  displayProfitability: boolean;
  name: string;
  yearProfitability: number | string;
  description: string;
  hasFeeder: boolean;
  eventName: string;
  productType?: string;
  '24m': number | string;
  updatedAt?: number | string;
  rank: number;
  share: number | string;
  initDate: number | string;
  category: string;
  monthProfitability: number | string;
  portfolioUpdatedAt: number;
  ticker: string;
  highlighted: boolean;
  platforms: (Platform | Platforms2 | Platforms3 | string)[];
  '12m': number | string;
  feeders: Feeder[];
  displayInFundList: boolean;
  init: number | string;
  updateAt?: number | string;
  idName?: string;
  collectionName?: string;
}

interface Feeder {
  feeder: string;
  eventName: string;
  cnpj: string;
  corporateName: string;
  isClosed?: boolean;
  id: number;
  feederName?: string;
}

interface Platforms3 {
  eventName: string;
  platformName: string;
  isClosed: boolean;
  logoUrl: string;
  collection: string;
  id: number;
  redirectUrl: string;
}

interface Platforms2 {
  platformName: string;
  id: number;
  isClosed: boolean;
  eventName: string;
  redirectUrl: string;
  logoUrl: string;
}

interface Platform {
  eventName: string;
  platformName: string;
  isClosed: boolean;
  logoUrl: string;
  collection?: string;
  id: number;
  redirectUrl: string;
}

export interface IGenericType {
  id: number;
  name: string;
}

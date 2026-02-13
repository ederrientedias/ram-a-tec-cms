export type FirestoreDocuments = "about" |
    "compliance" |
    "contacts" |
    "ethical_chagel" |
    'home' |
    'information_tranparency' |
    "invest" |
    "investment_funds" |
    "solutions" |
    "utils";

export interface IInvestmentFund {
    description: string;
    feeders: Feeder[];
    displayProfitability: boolean;
    portfolioUpdatedAt: number;
    share: number | string;
    init: number | string;
    hasFeeder: boolean;
    highlighted: boolean;
    ticker: string;
    platforms: (Platform | Platforms2 | Platforms3 | string)[];
    id: number;
    type: string;
    updatedAt?: number | string;
    rank: number;
    name: string;
    isClosed: boolean;
    yearProfitability: number | string;
    productType?: string;
    benchmark: string;
    category: string;
    initDate: number | string;
    displayInFundList: boolean;
    monthProfitability: number | string;
    '12m': number | string;
    '24m': number | string;
    eventName: string;
    redirectUrl: string;
    idName?: string;
    updateAt?: number | string;
}

interface Platforms3 {
    logoUrl: string;
    isClosed: boolean;
    redirectUrl: string;
    eventName: string;
    id: number;
    platformName: string;
}

interface Platforms2 {
    logoUrl: string;
    platformName: string;
    redirectUrl: string;
    isClosed: boolean;
    id: number;
    collection: string;
    eventName: string;
}

interface Platform {
    logoUrl: string;
    platformName: string;
    redirectUrl: string;
    isClosed: boolean;
    id: number;
    collection?: string;
    eventName: string;
}

interface Feeder {
    feeder: string;
    isClosed?: boolean;
    eventName: string;
    cnpj: string;
    id: number;
    corporateName: string;
    feederName?: string;
}    
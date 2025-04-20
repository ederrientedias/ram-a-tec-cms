export interface IPublicationRepsitory {
  get: () => Promise<IPublication[]>;
  set: (data: IPublication[]) => Promise<boolean>;
}

export interface IPublication {
  id?: number;
  theme: string;
  product: string;
  type: string;
  category: string;
  publicationDate: number;
  mediaOutlet: string;
  mediaLogo: string;
  description: string;
  link: string;
  createAt?: number;
}

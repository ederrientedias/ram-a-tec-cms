export interface IPublicationRepsitory {
  get: () => Promise<IPublication[]>;
  set: (data: IPublication[]) => Promise<boolean>;
}

export interface IPublicationService {
  getPublications: () => Promise<IPublication[]>;
  setPublications: (newPublication: IPublication) => Promise<boolean>;
  deletePublication: (id: string) => Promise<boolean>;
}

export interface IPublication {
  id: string;
  theme: string;
  product: string;
  type: string;
  category: string;
  publicationDate: string;
  mediaOutlet: string;
  mediaLogo: string;
  description: string;
  link: string;
  isPublic: boolean;
  createAt?: number;
}

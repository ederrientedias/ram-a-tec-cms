export interface IPublicationRepsitory {
  get: () => Promise<IPublication[]>;
  getMediaOutlet: () => Promise<IMediaOutlet[]>;
  set: (data: IPublication[]) => Promise<boolean>;
}

export interface IPublicationService {
  getPublications: () => Promise<IPublication[]>;
  getMediaOutlet: () => Promise<IMediaOutlet[]>;
  setPublications: (newPublication: IPublication) => Promise<boolean>;
  deletePublication: (id: string) => Promise<boolean>;
}

export interface IPublication {
  id: string;
  theme: string;
  type: string;
  publicationDate: string;
  mediaOutlet: string;
  mediaLogo: string;
  description: string;
  link: string;
  isPublic: boolean;
  createAt?: number;
  updatedAt?: number;
}

export interface IMediaOutlet {
  id: string;
  name: string;
  logoUrl: string;
}
export interface IType {
  id: string;
  type: string;
}

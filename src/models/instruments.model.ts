import { DocumentReference } from 'firebase/firestore';

export interface IGroup {
  code: string;
  name: string;
}

export interface IInstrumentGroup {
  uuid: string;
  name: string;
  idName: string;
  nickName: string;
  group: string;
  description: string;
}

export interface IInstrumentGroupRef {
  idName: string;
  group: string;
  instGroupId: string;
  docRef: any;
}

export interface IInstrument {
  uuid: string;
  idName: string;
  name: string;
  nickName: string;
  reference: string;
  instrumentGroup: IInstrumentGroupRef;
}

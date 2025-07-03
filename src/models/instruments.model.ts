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

export interface IFieldAndBlock {
  uuid: string;
  idName: string;
  blockName: string;
  form: IForm;
  instrumentsGroups: IInstrumentsGroups[];
}
export interface IForm {
  docRef: any;
  idName: string;
}

export interface IInstrumentsGroups {
  uuid: string;
  idName: string;
  group: string;
  instrumentGroupRef: any;
}

export interface IField {
  id: number;
  inputType: string;
  label: string;
  required: boolean;
  type: string;
  options?: any;
}

export interface IFieldsBlock {
  id: string;
  name: string;
  group: string;
}

export interface ISelectOption {
  id: string;
  options: any[];
}

export interface IField {
  id: string;
  fieldName: string;
  label: string;
  type: string;
  fieldBlockRef: string;
  placeholder: string | null;
  collectionData: string | null;
  optionsRef: string | null;
  isRequire: boolean;
}

export interface IInstrumentsGroup {
  id: string;
  group: string;
  name: string;
  nickname: string;
  description: string;
}

export interface IInstrument {
  id: string;
  name: string;
  nickname: string;
  instrumentGroupRef: string;
  legislation: string;
}

export interface IFormsMap {
  formId: string;
  instrumentId: string;
  name: string;
  nickname: string;
  instrumentGroupRef: IInstrumentGroupRef;
}

interface IInstrumentGroupRef {
  id: string;
  group: string;
}

export interface IForm {
  id: string;
  forms: Form[];
}

interface Form {
  id: string;
  name: string;
  fields: IField[];
}

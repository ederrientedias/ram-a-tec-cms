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

export interface IFieldsBlock {
  id: string;
  name: string;
  group: string[];
}

export interface ISelectOption {
  id: string;
  options: any[];
}

export interface IFieldRef {
  id: string;
  fieldBlockRef: string;
}

export interface IInstrumentsGroup {
  id: string;
  group: string;
  name: string;
  nickname: string;
  description: string;
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
  forms: ICollectionFields[];
}

export interface ICollectionFields {
  id: string;
  name: string;
  fields: IFieldRef[];
}

/*Intruments - Groups*/
export type InstrumentsGroupsCollection = 'groups' | 'instruments';

export interface IGroup {
  id: string;
  name: string;
  nickname: string;
  group: string;
  description: string;
}

export interface IInstrument {
  id: string;
  name: string;
  nickname: string;
  instrumentGroupRef: string;
  legislation: string;
}

/*Fields - Blocks*/
export type FieldsBlocksCollection = 'fields' | 'blocks';

export interface IField {
  id: string;
  idName: string;
  fieldName: string;
  label: string;
  type: string;
  fieldBlockRef: string;
  placeholder: string | null;
  collectionData: string | null;
  optionsRef: string | null;
  isRequired: boolean;
  inputMaskOptions: any | null;
  createdAt: number;
  updatedAt: number;
}

export interface IBlock {
  id: string;
  name: string;
  group: string | string[];
}

/*Registred Assets*/
export type RegisteredAssetsCollection = 'assets';

/*Registred Assets*/
export type RegisteredFormsCollection = 'forms';

/* Select - Option */
export type SelectOptionsCollection = 'options';

export interface IOption {
  id: string;
  options: any[];
}

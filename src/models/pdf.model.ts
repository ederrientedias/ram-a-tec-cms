export interface ICreatePDF {
  html: string | null;
  htmlContent: string | null;
  cssContent: string | null;
  uriGsUtil: string;
  filePath: string;
  pdfName: string;
  useHtmlContent: boolean;
  useCssContent: boolean;
  urlFontFamily: string | null;
}

export interface ICreatePDFProps {
  month: string;
  year: number;
  selectedFund: ISelectedFund;
  htmlContent: string;
  style: string;
}

export interface ISelectedFund {
  id: string;
  name: string;
  idName: string;
}

export interface IGeneratePDFResponse {
  fileUrl: string;
  statusCode: number;
  success: boolean;
}

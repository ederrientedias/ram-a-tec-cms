import { ICreatePDF, ICreatePDFProps, IGeneratePDFResponse } from '@/models/pdf.model';
import { createApiInstance } from '@/lib/api';

class PdfService {
  protected readonly base_url = import.meta.env.VITE_API_GENERATORS;

  /**
   * Gera um documento PDF com base nos dados fornecidos.
   * @param data - Os dados necessários para gerar o PDF.
   * @returns Uma promessa que se resolve com os dados PDF gerados.
   */
  public async generatePDF(props: ICreatePDFProps): Promise<IGeneratePDFResponse> {
    const api = createApiInstance(this.base_url);
    const data = await this.buildPDF(props);
    console.log(data);
    const response = await api.post<IGeneratePDFResponse>('/pdf-generator', data);
    return response.data;
  }

  /**
   * @description | Gera o PDF com base nas propriedades fornecidas.
   * @param props | {ICreatePDFProps}
   * @returns | Promise<ICreatePDF>
   */
  private async buildPDF(props: ICreatePDFProps): Promise<ICreatePDF> {
    const HTML = `
      <!DOCTYPE html>
      <html>
          <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link href="/style.css" rel="stylesheet" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
              rel="stylesheet"
              />
              <title>Transparencia Informacional</title>
              <style>${props.style}</style>
          </head>
          <body>${props.htmlContent}</body>
      </html>
    `;

    const data = {
      html: HTML,
      htmlContent: null,
      cssContent: null,
      uriGsUtil: import.meta.env.VITE_GOOGLE_STORAGE_URI,
      filePath: 'test/pdfs',
      pdfName: `sumario-${props.selectedFund.idName}`,
      useHtmlContent: false,
      useCssContent: false,
      urlFontFamily: null,
    };

    return data;
  }
}
export default new PdfService();

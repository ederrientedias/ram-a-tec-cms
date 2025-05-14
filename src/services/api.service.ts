import { AxiosResponse } from 'axios';
import api from '@/lib/api';

class ApiService {
  /**
   * @description Upload de arquivo
   * @param file Arquivo a ser enviado
   * @param path Caminho para onde o arquivo será enviado
   * @returns {AxiosResponse}
   */
  public async uploadFile(file: File, path: string): Promise<AxiosResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('path', path);

    return await api.post('/api/upload/storage', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * @description | Upload de CSV
   * @param csvFile | CSV a ser enviado
   * @returns {AxiosResponse}
   */
  public async uploadCSV(csvFile: File): Promise<AxiosResponse> {
    const form = new FormData();
    form.append('file', csvFile);

    return await api.post('/api/upload/csv', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
export default new ApiService();

import { AxiosResponse } from "axios";
import api from "@/lib/api";

class ApiService {
  /**
   * Upload de arquivo
   * @param file Arquivo a ser enviado
   * @param path Caminho para onde o arquivo será enviado
   * @returns {AxiosResponse}
   */
  public async uploadFile(file: File, path: string) {
    const form = new FormData();
    form.append("file", file);
    form.append("path", path);

    return await api.post("/api/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}
export default new ApiService();

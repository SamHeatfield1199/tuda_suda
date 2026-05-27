import client from './HttpClient';
// Интерфейс для запроса на создание формы опроса
interface CreateFormRequest {
  [key: string]: unknown;
  people: string[];
  places: string[];
}

// Интерфейс для ответа от сервера при создании формы опроса
interface CreateFormResponse {
  success: boolean;
  message: string;
}

// Класс для взаимодействия с API форм опросов
export default class FormsClient {
  // Метод для создания формы опроса
  static async createForm(data: CreateFormRequest): Promise<CreateFormResponse> {
    return client.post<CreateFormResponse>('/api/survey', data);
  }
}

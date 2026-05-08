import client from './HttpClient';

interface CreateFormRequest {
    [key: string]: unknown;
    people: string[];
    places: string[];
}

interface CreateFormResponse {
    success: boolean;
    message: string;
}

export default class FormsClient {
    static async createForm(data: CreateFormRequest): Promise<CreateFormResponse> {
        return client.post<CreateFormResponse>('/api/forms', data);
    }
}

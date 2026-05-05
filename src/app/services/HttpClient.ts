class HttpClient {
    private readonly baseUrl: string;

    constructor(url: string) {
        this.baseUrl = url;
    }

    public async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

export default new HttpClient('');

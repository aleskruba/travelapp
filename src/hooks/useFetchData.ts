import { HTTP_CONFIG } from '../constants/config';

export async function fetchData(url: string, method: string, credentials?: any) {
  const options: RequestInit = {
    ...HTTP_CONFIG,
    method,
    credentials: 'include',
  };

  if (method === 'POST' || method === 'PUT') {
    options.body = JSON.stringify(credentials);
  }

      const response = await fetch(url, options);

    return response;

}

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

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error('Server responded with a non-2xx status');
    }

    return response;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // Handle network-related errors such as server being down
      throw new Error('Failed to connect to the server. Please try again later.');
    } else {
      throw error; // Re-throw any other errors
    }
  }
}

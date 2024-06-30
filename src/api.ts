// src/api.ts
import { BASE_URL, HTTP_CONFIG } from './constants/config';
import { UserProps } from './types';



export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await fetch(`${BASE_URL}/login`, {
    ...HTTP_CONFIG,
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to login');
  }

  return response.json();
};

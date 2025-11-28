import { request as playwrightRequest } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetch a new auth token from the authentication API.
 * @returns Promise<string> - The access token
 */
export async function getAuthToken(): Promise<string> {
  // Create a temporary request context
  const requestContext = await playwrightRequest.newContext();

  // Call the auth API
  const response = await requestContext.post(process.env.AUTH_URL!, {
    headers: {
      'Content-Type': 'application/json',
    },
    // biller 4850
    data: {
      token: '0dd704b5-0ea4-4b26-b400-bc1807d54458',
      clientId: 'supplier_client',
      secret: 'q<8X8Eu4,Lr[4sxn',
      refreshToken: '',
    },
  });

  if (!response.ok()) {
    throw new Error(`❌ Failed to fetch auth token: ${response.status()}`);
  }

  const body = await response.json();

  // Assuming the API returns { data: { token: "..." } }
  const accessToken = body.data.token;

  if (!accessToken) {
    throw new Error('❌ Auth API response missing token');
  }

  //console.log('✅ Token fetched successfully:', accessToken);

  return accessToken;
}
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
    data: {
      token: process.env.TOKEN_KEY,
      clientId: process.env.CLIENT_ID,
      secret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
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
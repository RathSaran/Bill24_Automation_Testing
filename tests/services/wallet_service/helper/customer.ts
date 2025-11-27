import { request as playwrightRequest } from '@playwright/test';
import { getAuthToken } from './merchat_authorization';

export async function create_customer (body: any) : Promise<any>{
const requestContext = await playwrightRequest.newContext();
    const authToken = await getAuthToken();
    // Function implementation
    const response = await requestContext.post('/customer/create', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
        data: body,
    });
    const response_customer= await response.json();
    //console.log("response",response_customer);
    return response_customer;
}
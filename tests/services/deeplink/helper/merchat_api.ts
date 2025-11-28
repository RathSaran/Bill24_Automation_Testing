import { request as playwrightRequest } from '@playwright/test';
import { getAuthToken } from './merchat_autorization';


export async function init_transaction(body:any): Promise<any> {
const requestContext = await playwrightRequest.newContext();
const authToken= await getAuthToken();
const response= await requestContext.post('/transaction/v2/init',{
    headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
        data: body,
})
    
    return response.json();
}

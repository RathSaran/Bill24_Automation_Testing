import { request as playwrightRequest } from '@playwright/test';
import CryptoJS from "crypto-js";
import { getAuthToken } from "../../merchat_authorization";


export async function getsinglebill (bill_ref :string) : Promise<any>{
const requestContext = await playwrightRequest.newContext();
    const authToken = await getAuthToken();
    // Function implementation
    const response = await requestContext.get(`/instant_payment/get_single_bill/${bill_ref}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
    });
    const bill_data= await response.json();
    //console.log("response",bill_data);
    return bill_data;
}
import { request as playwrightRequest } from '@playwright/test';
import CryptoJS from "crypto-js";
import { getAuthToken } from "../../../merchat_authorization";

export async function get_payment_methods(customer_sync_code: string): Promise<any> {
    const requestContext = await playwrightRequest.newContext();
    const authToken = await getAuthToken();
    const response = await requestContext.get(`/instant_payment/${customer_sync_code}/get_payment_methods`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
    });
    //console.log("Get Payment Methods Status:", response.status());
    const paymentMethods = await response.json();
    const sub_title = paymentMethods?.data?.[0]?.sub_title;
    const balanceMatch = sub_title.match(/Balance\s*:\s*([\d,]+)/);

    let balanceNumber = 0;

    if (balanceMatch) {
        const balanceString = balanceMatch[1];
        balanceNumber = Number(balanceString.replace(/,/g, ""));
    }
    //console.log("Payment Methods Response:", paymentMethods);
    if (paymentMethods.code == "311") {
        throw new Error(`❌ Failed to fetch payment methods : ${paymentMethods.message}`);
    } else {
        const token = paymentMethods?.data?.[0]?.token;
        const balance_and_token = {
            token: token,
            balance: balanceNumber
        };
        //console.log("Payment Methods Data Token:", token);
        return balance_and_token;
    }
}
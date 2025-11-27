import { request as playwrightRequest } from '@playwright/test';
import CryptoJS from "crypto-js";
import { getAuthToken } from "./merchat_authorization";
import { get_payment_methods } from './get_payment_method';
import { generateHash } from '../data/function';

export async function pushbillwithpayment(body: any): Promise<any> {
    const requestContext = await playwrightRequest.newContext();
    const merchant_token = await getAuthToken(); // due date 5 minutes later
    const push_bill_with_payment_response = await requestContext.post('/bill_payment/push_bill_with_payment', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${merchant_token}`,
        },
        data: body
    });

    const push_bill_with_payment_json = await push_bill_with_payment_response.json();
    //console.log("body response push bill with payment:", await push_bill_with_payment_response.text());
    return push_bill_with_payment_json;
}
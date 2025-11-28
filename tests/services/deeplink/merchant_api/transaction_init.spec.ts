import { test, expect } from '@playwright/test';
import { init_transaction } from '../helper/merchat_api';
import { gidentity_code,purpose_of_transaction,gCustomerName,gcustomer_code } from '../data/function'



test.describe('Test Case init Transaction', () => {
    test('Case init transaction amount KHR', async ({ request }) => {
        const identity_code = await gidentity_code();
        const body = {
            "identity_code": identity_code,
            "purpose_of_transaction": purpose_of_transaction(),
            "device_code": "0003485929435",
            "description": "This is my testing",
            "currency": "KHR",
            "amount": 1000,
            "language": "en",
            "cancel_url": "",
            "redirect_url": "testing",
            "channel_code": "",
            "user_ref": "X00991",
            "customers": [
                {
                    "branch_code": "",
                    "branch_name": "",
                    "customer_code": gcustomer_code(),
                    "customer_name": gCustomerName(),
                    "customer_name_latin": "",
                    "bill_no": identity_code,
                    "amount": 1000
                }
            ]
        }
        const init = await init_transaction(body);
        console.log('init transacrion:',init);
    })
})
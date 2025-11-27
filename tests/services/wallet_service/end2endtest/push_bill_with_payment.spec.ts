import { test, expect } from "@playwright/test";
import { getAuthToken } from "../helper/merchat_authorization";
import { create_customer } from "../helper/customer";
import { get_payment_methods } from '../helper/get_payment_method'
import { generateCustomerName, generateSyncCode, generateHash, generate_bill_ref_id } from '..//data/function';

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let bill_number = generate_bill_ref_id();
let customer_sync_code = "VV0004";
let bill_amount = 500;
let bill_currency = "KHR";
let To_cpode = "ST001";
const now = new Date();
const bill_date = now.toISOString().split("T")[0]
const dueDateObj = new Date(now);
dueDateObj.setDate(now.getDate() + 30);
const due_date = dueDateObj.toISOString().split("T")[0];

const hash_value = {
    ref_id: bill_number,
    date: bill_date,
    currency: bill_currency,
    total_amount: bill_amount,
    customer_sync_code: customer_sync_code,
    payment_to: To_cpode
};

// test case for push bill with payment api

test.describe("push bill with payment API Tests", () => {
    test("Push bill with payment correct data and verify customer wallet balance", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const customer_sync_code = "VV0001"
        const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        const token = get_payment_methods_response.token;
        const wallet_balance = get_payment_methods_response.balance;
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: bill_amount,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": due_date, // due date 5 minutes later
                "description": "Session 665048751 (Sakhan Sophana) - Start Date: Nov 6, 2025 at 4:43:05 PM at charging station BYDC202505082252 - Duration: 00:15:05",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": token,
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });

        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("SUCCESS");
        expect(push_bill_with_payment_json.message).toBe("Bill pushed and payment captured successfully.");

        expect(push_bill_with_payment_json).toMatchObject({
            code: "SUCCESS",
            message: "Bill pushed and payment captured successfully.",
            message_kh: expect.any(String),
            data: {
                bill: {
                    status: "success",
                },
                payment: {
                    status: "success",
                }
            }
        });
        // Verify wallet balance after payment
        console.log('waiting for wallet balance to update...');
        await wait(20000); // Wait for 20 seconds to allow the wallet balance to update
        const verify_wallet_balance = await request.post('/instant_payment/get_wallet_balance', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: { "customer_sync_code": customer_sync_code },
        });
        const verify_wallet_balance_json = await verify_wallet_balance.json();
        expect(verify_wallet_balance.ok()).toBeTruthy();
        expect(verify_wallet_balance_json.data[0].balance).toBe(wallet_balance - bill_amount);
    });
    test("Push bill with payment without Payment_token and verify customer wallet balance", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const customer_sync_code = 'VV0003';
        const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        //const token = get_payment_methods_response.token;
        bill_number = generate_bill_ref_id();
        const wallet_balance = get_payment_methods_response.balance;
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: bill_amount,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": due_date, // due date 5 minutes later
                "description": "Session 665048751 (Sakhan Sophana) - Start Date: Nov 6, 2025 at 4:43:05 PM at charging station BYDC202505082252 - Duration: 00:15:05",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });

        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("SUCCESS");
        expect(push_bill_with_payment_json.message).toBe("Bill pushed and payment captured successfully.");

        expect(push_bill_with_payment_json).toMatchObject({
            code: "SUCCESS",
            message: "Bill pushed and payment captured successfully.",
            message_kh: expect.any(String),
            data: {
                bill: {
                    status: "success",
                },
                payment: {
                    status: "success",
                }
            }
        });
        // Verify wallet balance after payment
        console.log('waiting for wallet balance to update...');
        await wait(20000); // Wait for 15 seconds to allow the wallet balance to update
        const verify_wallet_balance = await request.post('/instant_payment/get_wallet_balance', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: { "customer_sync_code": customer_sync_code },
        });
        const verify_wallet_balance_json = await verify_wallet_balance.json();
        expect(verify_wallet_balance.ok()).toBeTruthy();
        expect(verify_wallet_balance_json.data[0].balance).toBe(wallet_balance - bill_amount);
    });
});

test.describe("nagative test for push bill with payment API", () => {
    test("Push bill with payment incorrect hash and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later    
        const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        const token = get_payment_methods_response.token;
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": due_date, // due date 5 minutes later
                "description": "Session 665048751 (Sakhan Sophana) - Start Date: Nov 6, 2025 at 4:43:05 PM at charging station BYDC202505082252 - Duration: 00:15:05",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": token,
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": "incorrect_hash_value",
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("318");
        expect(push_bill_with_payment_json.message).toBe("Invalid hash token");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "318",
            message: "Invalid hash token",
            message_kh: expect.any(String),
            data: {
                bill: null,
                payment: null
            }
        });
    });
    test("Push bill with payment incorrect payment method token and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later    
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": due_date, // due date 5 minutes later
                "description": "Session 665048751 (Sakhan Sophana) - Start Date: Nov 6, 2025 at 4:43:05 PM at charging station BYDC202505082252 - Duration: 00:15:05",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "incorrect_payment_method_token",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("314");
        expect(push_bill_with_payment_json.message).toBe("Payment method token invalid");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "314",
            message: "Payment method token invalid",
            message_kh: expect.any(String),
            data: {
                bill: null,
                payment: null
            }
        });
    });
    test("push bill with payment missing field required bill_ref and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                // "ref_id": bill_number, // missing field
                "date": bill_date,
                "due_date": due_date, // due date 5 minutes later
                "description": "Session",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("The RefId field is required., Please provide [ref_id].");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "The RefId field is required., Please provide [ref_id].",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment missing field required date and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": "", // missing field
                "due_date": due_date, // due date 5 minutes later
                "description": "Session",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.stringContaining("The payload field is required."),
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment missing field required due_date and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                //"due_date": "", // missing field
                "description": "Session",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("Please provide [due_date]., MsgDueDateMustBeGreaterThanCurrentDate");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "Please provide [due_date]., MsgDueDateMustBeGreaterThanCurrentDate",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment missing field required currency and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": "2026-12-28", // missing field
                "description": "Session",
                "currency": "",
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("Please provide [currency].");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "Please provide [currency].",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment missing field required customer_sync_code and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": "2026-12-28", // missing field
                "description": "Session",
                "currency": "KHR",
                "total_amount": bill_amount,
                "customer_sync_code": "",
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("Please provide [customer_sync_code].");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "Please provide [customer_sync_code].",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment missing field required payment_to and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": "2026-12-28", // missing field
                "description": "Session",
                "currency": "KHR",
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": "",
                "total_amount_khr": bill_amount,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("Please provide [payment_to].");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "Please provide [payment_to].",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment missing field required total_amount,total_amount_khr and verify message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        const token = get_payment_methods_response.token;
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: 0,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        }
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": "2026-12-28", // missing field
                "description": "Session",
                "currency": bill_currency,
                "total_amount": 0,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": token,
                "payment_to": To_cpode,
                "total_amount_khr": 0,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": 0,
                        "amount": 0
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("SUCCESS");
        expect(push_bill_with_payment_json.message).toBe("Bill pushed and payment captured successfully.");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "SUCCESS",
            message: "Bill pushed and payment captured successfully.",
            message_kh: expect.any(String),
            data: {
                "bill": {
                    "status": "success"
                },
                "payment": {
                    "status": "success"
                }
            }
        });
    });
    test("push bill with payment miss match total_amount with amount and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": "2026-12-28", // missing field
                "description": "Session",
                "currency": "KHR",
                "total_amount": 100,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": 100,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": 0,
                        "amount": 50
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("The [total_amount] field must be equal to 50.");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "The [total_amount] field must be equal to 50.",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment case date > due_date and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": "2030-12-30",
                "due_date": due_date, // missing field
                "description": "Session",
                "currency": "KHR",
                "total_amount": 100,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "some_token",
                "payment_to": To_cpode,
                "total_amount_khr": 100,
                "hash": generateHash(hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": 0,
                        "amount": 100
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("ERR_MISSED_FIELD");
        expect(push_bill_with_payment_json.message).toBe("MsgDueDateMustBeGreaterThanCurrentDate");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: "MsgDueDateMustBeGreaterThanCurrentDate",
            message_kh: expect.any(String),
            data: null
        });
    });
    test("push bill with payment case Insufficient balance and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const bill_ref_number = await generate_bill_ref_id();
        const data = {
            sync_code: sync_code,
            name: customer_name,
            phone: "099 887 521",
            email: customer_name + "@gmail.com",
            name_kh: "គង្គារ",
            wallet: [
                {
                    name: customer_name,
                    currency: "KHR"
                }
            ]
        };
        const new_hash_value = {
            ref_id: bill_ref_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: bill_amount,
            customer_sync_code: sync_code,
            payment_to: To_cpode
        };

        const create_customer_response = await create_customer(data);
        console.log("create customer success!");

        await wait(5000); // waiting 5 seconds
        const get_payment_methods_response = await get_payment_methods(sync_code);
        const token = get_payment_methods_response.token;
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },

            data: {
                "ref_id": bill_ref_number,
                "date": bill_date,
                "due_date": due_date, // missing field
                "description": "Session",
                "currency": "KHR",
                "total_amount": bill_amount,
                "customer_sync_code": sync_code,
                "payment_method_token": token,
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("401");
        expect(push_bill_with_payment_json.message).toBe("Insufficient balance in the wallet to proceed with payment.");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "401",
            message: "Insufficient balance in the wallet to proceed with payment.",
            message_kh: expect.any(String),
            data: {
                "bill": null,
                "payment": null
            }
        });
    });
    test("push bill with payment case duplication bill_ref and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const get_bill_id = await request.get(`/bill_payment/${customer_sync_code}/get_bills`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            }
        });
        const bill_ids = await get_bill_id.json();
        const ref_id = bill_ids?.data?.[0]?.ref_id || null;
        const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        const token = get_payment_methods_response.token;
        const new_hash_value = {
            ref_id: ref_id,
            date: bill_date,
            currency: bill_currency,
            total_amount: bill_amount,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": ref_id,
                "date": bill_date,
                "due_date": "2025-12-30",
                "description": "Session",
                "currency": "KHR",
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": token,
                "payment_to": To_cpode,
                "total_amount_khr": bill_amount,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": 0,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("327");
        expect(push_bill_with_payment_json.message).toBe("Bill already exist");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "327",
            message: "Bill already exist",
            message_kh: expect.any(String),
            data: {
                "bill": null,
                "payment": null
            }
        });
    });
    test("push bill with payment invalid payment_to and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        const token = get_payment_methods_response.token;
        bill_number = generate_bill_ref_id();
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: bill_amount,
            customer_sync_code: customer_sync_code,
            payment_to: "1234"
        };
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": due_date, // missing field
                "description": "Session",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": token,
                "payment_to": new_hash_value.payment_to,
                "total_amount_khr": bill_amount,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        //console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("315");
        expect(push_bill_with_payment_json.message).toBe("Invalid payment_to.Supplier not found.");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "315",
            message: "Invalid payment_to.Supplier not found.",
            message_kh: expect.any(String),
            data: {
                "bill": null,
                "payment": null
            }
        });
    });
    test("push bill with payment invalid customer_syn_code and verify error message", async ({ request }) => {
        const merchant_token = await getAuthToken(); // due date 5 minutes later
        const customer_sync_code = await generateCustomerName();
        // const get_payment_methods_response = await get_payment_methods(customer_sync_code);
        // const token = get_payment_methods_response.token;
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: bill_amount,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const push_bill_with_payment_response = await request.post('/bill_payment/push_bill_with_payment', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "ref_id": bill_number,
                "date": bill_date,
                "due_date": due_date, // missing field
                "description": "Session",
                "currency": bill_currency,
                "total_amount": bill_amount,
                "customer_sync_code": customer_sync_code,
                "payment_method_token": "123",
                "payment_to": new_hash_value.payment_to,
                "total_amount_khr": bill_amount,
                "hash": generateHash(new_hash_value),
                "details": [
                    {
                        "item_name": "testing",
                        "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                        "quantity": 1,
                        "price": bill_amount,
                        "amount": bill_amount
                    }
                ]
            }
        });
        const push_bill_with_payment_json = await push_bill_with_payment_response.json();
        //console.log("body response:", await push_bill_with_payment_response.text());
        expect(push_bill_with_payment_response.ok()).toBeTruthy();
        expect(push_bill_with_payment_json.code).toBe("311");
        expect(push_bill_with_payment_json.message).toBe("Customer not found");
        expect(push_bill_with_payment_json).toMatchObject({
            code: "311",
            message: "Customer not found",
            message_kh: expect.any(String),
            data: {
                "bill": null,
                "payment": null
            }
        });
    });
});
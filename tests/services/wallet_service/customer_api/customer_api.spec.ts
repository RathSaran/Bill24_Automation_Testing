
import { test, expect } from '@playwright/test';
import * as CryptoJS from "crypto-js";
import { getAuthToken } from "../helper/merchat_authorization";
import { generateCustomerName, generateSyncCode } from '../data/function';
import { create_customer } from "../helper/customer";

//for duplicate name test case
let name: string;
name = 'John Doe';

//for duplicate sync_code test case and update and delete customer test case
let sync_code: string;
sync_code = 'BBQ001';

// test case for create customer api
test.describe('Customer', () => {
    test('Customer API with correct customer data', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();

        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 887 521",
                "email": customer_name + "@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        expect(customer_response.ok()).toBeTruthy();
        const customer_data = await customer_response.json();
        expect(customer_data.data.sync_code).toBe(customer_sync_code);
        expect(customer_data.data.name).toBe(customer_name);
        expect(customer_data.data.phone).toBe("099 887 521");
        expect(customer_data.data.email).toBe(customer_name + "@gmail.com");
        expect(customer_data).toMatchObject({
            code: "SUCCESS",
            message: "Success",
            message_kh: expect.any(String),
            data: {
                id: expect.any(String),
                sync_code: expect.any(String),
                name: expect.any(String),
                name_kh: expect.any(String),
                phone: expect.any(String),
                email: expect.any(String),
                wallet: [
                    {
                        name: expect.any(String),
                        currency: "KHR"
                    }
                ]
            }
        });

    });
    test('Input customer only required fields', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name
            },
        });
        const customer_data = await customer_response.json();
        expect(customer_response.status()).toBe(200);
        expect(customer_data.code).toBe("SUCCESS");
        expect(customer_data.message).toBe("Success");
        expect(customer_data).toMatchObject({
            code: "SUCCESS",
            message: "Success",
            message_kh: expect.any(String),
            data: {
                id: expect.any(String),
                sync_code: expect.any(String),
                name: customer_data.data.name,
                name_kh: null,
                phone: null,
                email: null,
                wallet: []
            }
        });
    });
    test('Input customer with max-length values Sync Code', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = "CS1006234567uikewfrkfjksdfklalsjfksdlkjkskdfkajdkjkdfkkakfjksd";
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "09988",
                "email": "testing@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        const customer_data = await customer_response.json();
        expect(customer_response.status()).toBe(200);
        expect(customer_data.code).toBe("ERR_MISSED_FIELD");
        expect(customer_data.message).toBe("[sync_code] must have 50 or fewer digits. Please adjust and retry.");
        expect(customer_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });
    });
    test('Customer API with case duplicate customer name', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": name,
                "phone": "099 887 521",
                "email": customer_name + "@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        expect(customer_response.ok()).toBeTruthy();
        const customer_data = await customer_response.json();
        expect(customer_data.data.sync_code).toBe(customer_sync_code);
        expect(customer_data.data.name).toBe(name);
        expect(customer_data.data.phone).toBe("099 887 521");
        expect(customer_data.data.email).toBe(customer_name + "@gmail.com");
        expect(customer_data).toMatchObject({
            code: "SUCCESS",
            message: "Success",
            message_kh: expect.any(String),
            data: {
                id: expect.any(String),
                sync_code: expect.any(String),
                name: expect.any(String),
                name_kh: expect.any(String),
                phone: expect.any(String),
                email: expect.any(String),
                wallet: [
                    {
                        name: expect.any(String),
                        currency: "KHR"
                    }
                ]
            }
        });

    });
});
test.describe('Customer negative cases', () => {
    test('Create customer with invalid token', async ({ request }) => {
        const invalid_token = "invalid_token";
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${invalid_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 887 521",
                "email": customer_name + "@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        expect(customer_response.status()).toBe(401);
    });
    test('Input customer with out required field', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "name": "John Doe",
                "name_kh": "គង្គារ",
                "phone": "099 887 521",
                "email": "",
                "wallet": [
                    {
                        "name": "CS003-Wallet",
                        "currency": "KHR"
                    }
                ]
            }
        });
        const customer_data = await customer_response.json();
        expect(customer_response.status()).toBe(200);
        expect(customer_data.code).toBe("ERR_MISSED_FIELD");
        expect(customer_data.message).toBe("Please provide [sync_code].");
        expect(customer_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });

    });
    test('Input customer with duplicate sync_code', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = 'VV0004';
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 887 521",
                "email": customer_name + "@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        const customer_data = await customer_response.json();
        expect(customer_response.status()).toBe(200);
        expect(customer_data.code).toBe("310");
        expect(customer_data.message).toBe("This customer already exist");
        expect(customer_data).toMatchObject({
            code: "310",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: expect.any(Object)
        });
    });
    test('Input customer with invalid email format', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 887 521",
                "email": "invalid-email-format",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        const customer_data = await customer_response.json();
        expect(customer_response.status()).toBe(200);
        expect(customer_data.code).toBe("ERR_MISSED_FIELD");
        expect(customer_data.message).toBe("'Email' is not a valid email address.");
        expect(customer_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });
    });
});

// test case for update customer api

test.describe('Update Customer', () => {
    test('Update customer with correct data', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = generateSyncCode();
        const customer_name = generateCustomerName();
        const body = {
            "sync_code": customer_sync_code,
            "name": customer_name,
            "phone": "099 887 521",
            "email": customer_name + "@gmail.com",
            "name_kh": "គង្គារ",
            "wallet": [
                {
                    "name": customer_name,
                    "currency": "KHR"
                }
            ]
        };
        const customer = await create_customer(body);
        expect(customer.code).toBe('SUCCESS');
        
        const updated_name = "Updated Name";
        const update_response = await request.post('/customer/update', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": updated_name,
                "phone": "099 999 999",
                "email": "updated_email@example.com",
                "name_kh": "ឈ្មោះបានធ្វើបច្ចុប្បន្នភាព"
            },
        });
        expect(update_response.ok()).toBeTruthy();
        const update_data = await update_response.json();
        expect(update_data.code).toBe("000");
        expect(update_data.data.name).toBe(updated_name);
        expect(update_data.data.phone).toBe("099 999 999");
        expect(update_data.data.email).toBe("updated_email@example.com");
        expect(update_data.data.name_kh).toBe("ឈ្មោះបានធ្វើបច្ចុប្បន្នភាព");
        expect(update_data).toMatchObject({
            code: "000",
            message: "Customer profile updated successfully.",
            message_kh: expect.any(String),
            data: {
                id: expect.any(String),
                sync_code: expect.any(String),
                name: expect.any(String),
                name_kh: expect.any(String),
                phone: expect.any(String),
                email: expect.any(String),
            }
        });
    });
    test('Update customer with missing required field', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const update_response = await request.post('/customer/update', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "name": "Name Without Sync Code"
            },
        });
        const update_data = await update_response.json();
        expect(update_response.status()).toBe(200);
        expect(update_data.code).toBe("ERR_MISSED_FIELD");
        expect(update_data.message).toBe("Please provide [sync_code].");
        expect(update_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });
    });
    test('Update customer with invalid token', async ({ request }) => {
        const invalid_token = "invalid_token";
        const customer_sync_code = "CSV2001";
        const update_response = await request.post('/customer/update', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${invalid_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": "Name With Invalid Token"
            },
        });
        expect(update_response.ok()).toBeFalsy();
        expect(update_response.status()).toBe(401);
    });
});

// test case for delete customer api

test.describe('delete Customer', () => {
    test('Delete customer with correct data', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = generateSyncCode();
        const customer_name = generateCustomerName();
        const body = {
            "sync_code": customer_sync_code,
            "name": customer_name,
            "phone": "099 887 521",
            "email": customer_name + "@gmail.com",
            "name_kh": "គង្គារ",
            "wallet": [
                {
                    "name": customer_name,
                    "currency": "KHR"
                }
            ]
        };
        const customer = await create_customer(body);
        expect(customer.code).toBe('SUCCESS');
        const delete_response = await request.post('/customer/delete', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
            },
        });
        expect(delete_response.ok()).toBeTruthy();
        const delete_data = await delete_response.json();
        expect(delete_data.code).toBe("000");
        expect(delete_data.message).toBe(" Customer deleted successfully. ");
        expect(delete_data).toMatchObject({
            code: "000",
            message: " Customer deleted successfully. ",
            message_kh: expect.any(String),
            data: expect.any(Object)
        });
    });
    test('Delete customer with missing required field', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const delete_response = await request.post('/customer/delete', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
            },
        });
        //expect(delete_response.ok()).toBeFalsy();
        const delete_data = await delete_response.json();
        expect(delete_response.status()).toBe(200);
        expect(delete_data.code).toBe("ERR_MISSED_FIELD");
        expect(delete_data.message).toBe("Please provide [customer_sync_code].");
        expect(delete_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });
    });
});

// test case for get customer detail api
test.describe('Get customer Detail', () => {
    test('Get customer detail with correct data', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 887 521",
                "email": customer_name + "@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        expect(customer_response.ok()).toBeTruthy();
        const get_response = await request.post('/customer/get_customer_detail', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
            },
        });
        expect(get_response.ok()).toBeTruthy();
        const get_data = await get_response.json();
        console.log("Get Customer Data:", get_data);
        expect(get_data.code).toBe("000");
        expect(get_data.data.sync_code).toBe(customer_sync_code);

        expect(get_data).toMatchObject({
            code: "000",
            message: "Success",
            message_kh: expect.any(String),
            data: {
                sync_code: customer_sync_code,
                name: customer_name,
                name_kh: expect.any(String),
                phone: "099 887 521",
                email: customer_name + "@gmail.com",
                walletBalances: [{
                    id: expect.any(String),
                    name: customer_name,
                    balance: 0,
                    currency: "KHR",
                }]
            }
        });
    });
});
test.describe('Get customer Detail negative cases', () => {
    test('Get customer detail with missing required field', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const get_response = await request.post('/customer/get_customer_detail', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
            },
        });
        const get_data = await get_response.json();
        expect(get_response.status()).toBe(200);
        expect(get_data.code).toBe("ERR_MISSED_FIELD");
        expect(get_data.message).toBe("Please provide [customer_sync_code].");
        expect(get_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });
    });
    test('Get customer detail with invalid token', async ({ request }) => {
        const invalid_token = "invalid_token";
        const customer_sync_code = "CSV2001";
        const get_response = await request.post('/customer/get_customer_detail', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${invalid_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
            },
        });
        expect(get_response.ok()).toBeFalsy();
        expect(get_response.status()).toBe(401);
    });
});

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// test case Get wallet balance by customer sync code


test.describe('Get wallet balance by customer sync code', () => {
    test('Get wallet balance with correct data', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 887 521",
                "email": customer_name + "@gmail.com",
                "name_kh": "គង្គារ",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        expect(customer_response.ok()).toBeTruthy();
        await wait(5000); // wait for 5 seconds to ensure data is processed
        const wallet_response = await request.post('/instant_payment/get_wallet_balance', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "customer_sync_code": customer_sync_code,
            },
        });
        //console.log("Wallet Response:", await wallet_response.json());
        expect(wallet_response.ok()).toBeTruthy();
        const wallet_data = await wallet_response.json();
        expect(wallet_data.code).toBe("000");
        expect(wallet_data).toMatchObject({
            code: "000",
            message: "Success",
            message_kh: expect.any(String),
            data: [{
                id: expect.any(String),
                name: customer_name,
                balance: expect.any(Number),
                currency: "KHR",
            }]
        });
    });
    test('Get wallet balance with missing required field', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const wallet_response = await request.post('/instant_payment/get_wallet_balance', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
            },
        });
        const wallet_data = await wallet_response.json();
        expect(wallet_response.status()).toBe(200);
        expect(wallet_data.code).toBe("ERR_MISSED_FIELD");

        expect(wallet_data.message).toBe("Please provide [customer_sync_code].");
        expect(wallet_data).toMatchObject({
            code: "ERR_MISSED_FIELD",
            message: expect.any(String),
            message_kh: expect.any(String),
            data: null
        });
    });
    test('Get wallet balance with invalid token', async ({ request }) => {
        const invalid_token = "invalid_token";
        const customer_sync_code = "CSV2001";
        const wallet_response = await request.post('/instant_payment/get_wallet_balance', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${invalid_token}`,
            },
            data: {
                "customer_sync_code": customer_sync_code,
            },
        });
        expect(wallet_response.ok()).toBeFalsy();
        expect(wallet_response.status()).toBe(401);
    });
    test('Get wallet balance with non-existing sync code', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = "NONEXIST123";
        const wallet_response = await request.post('/instant_payment/get_wallet_balance', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "customer_sync_code": customer_sync_code,
            },
        });
        expect(wallet_response.ok()).toBeTruthy();
        const wallet_data = await wallet_response.json();
        expect(wallet_data.code).toBe("311");
        expect(wallet_data.message).toBe("Customer not found");
        expect(wallet_data).toMatchObject({
            code: "311",
            message: expect.any(String),
            message_kh: expect.any(String)

        });
    });
});


// test case Get Payment Methods by customer sync code

test.describe('Get Payment Methods by customer sync code', () => {
    test('Get Payment Methods with correct data', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const customer_sync_code = await generateSyncCode();
        const customer_name = await generateCustomerName();
        const create_customer_response = await request.post('/customer/create', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
            data: {
                "sync_code": customer_sync_code,
                "name": customer_name,
                "phone": "099 123 456",
                "email": "paymentmethodtest@example.com",
                "name_kh": "តេស្តវិធីសាស្រ្តបង់ប្រាក់",
                "wallet": [
                    {
                        "name": customer_name,
                        "currency": "KHR"
                    }
                ]
            },
        });
        expect(create_customer_response.ok()).toBeTruthy();
        const payment_response = await request.get(`instant_payment/${customer_sync_code}/get_payment_methods`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
        });
        expect(payment_response.ok()).toBeTruthy();
        const payment_data = await payment_response.json();
        expect(payment_data.code).toBe("000");
        expect(payment_data).toMatchObject({
            code: "000",
            message: "Success",
            message_kh: expect.any(String),
            data: [
                {
                    id: expect.any(String),
                    type: expect.any(String),
                    name: expect.any(String),
                    sub_title: expect.any(String),
                    sub_title_kh: expect.any(String),
                    token: expect.any(String),
                    is_default: expect.any(Boolean),
                    logo: expect.any(String),
                }
            ]
        });
    });
    test('Get Payment Methods with invalid customer sync code', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const invalid_sync_code = "INVALIDSYNC123";
        const payment_method_response = await request.get(`instant_payment/${invalid_sync_code}/get_payment_methods`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchant_token}`,
            },
        });
        //console.log("Payment Method Response:", await payment_method_response.json());
        expect(payment_method_response.status()).toBe(200);
        expect(payment_method_response).toBeDefined();
        const payment_data = await payment_method_response.json();
        expect(payment_data).toMatchObject({
            code: "311",
            message: "Customer not found",
            message_kh: expect.any(String),
            data: []
        });
    });
    test('Get Payment Methods with invalid token', async ({ request }) => {
        const invalid_token = "invalid_token";
        const customer_sync_code = "CSV2001";
        const payment_method_response = await request.get(`instant_payment/${customer_sync_code}/get_payment_methods`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${invalid_token}`,
            },
        });
        expect(payment_method_response.ok()).toBeFalsy();
        expect(payment_method_response.status()).toBe(401);
    });
});
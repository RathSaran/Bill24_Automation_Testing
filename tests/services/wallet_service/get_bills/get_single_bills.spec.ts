import { test, expect } from '@playwright/test';
import { getAuthToken } from "../../../merchat_authorization";
import { getsinglebill } from "../../helper/get_bill"
import { generate_bill_ref_id, generateCustomerName, generateSyncCode, generateHash } from '../../data/function';
import { pushbillwithpayment } from '../../helper/push_bill_with_payment';
import { create_customer } from '../../helper/customer';

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const now = new Date();
const bill_date = now.toISOString().split("T")[0]
const dueDateObj = new Date(now);
dueDateObj.setDate(now.getDate() + 30);
const due_date = dueDateObj.toISOString().split("T")[0];

let bill_number = generate_bill_ref_id();
let customer_sync_code = 'VV0004'
let bill_currency = "KHR"
let To_cpode = 'ST001'

// Get single bill

test.describe('Get single bill', () => {
    test('Case get single bill amount 0', async ({ request }) => {
        const merchant_token = await getAuthToken();
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: 0,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const body = {
            "ref_id": bill_number,
            "date": bill_date,
            "due_date": due_date, // due date 5 minutes later
            "description": "Session 100kwh",
            "currency": bill_currency,
            "total_amount": 0,
            "customer_sync_code": customer_sync_code,
            "payment_method_token": '',
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
        const push_bill_with_payment = await pushbillwithpayment(body);
        const get_bill = await getsinglebill(bill_number);
        expect(get_bill.code).toBe("000");
        expect(get_bill.message).toBe("Success");
        expect(get_bill).toMatchObject({
            code: '000',
            message: 'Success',
            message_kh: 'ជោគជ័យ',
            data: {
                ref_id: bill_number,
                date: expect.any(String),
                due_date: expect.any(String),
                description: expect.any(String),
                currency: body.currency,
                total_amount: 0,
                customer_sync_code: customer_sync_code,
                bill_status: 'paid',
                details: [

                    {
                        "item_name": expect.any(String),
                        "description": expect.any(String),
                        "quantity": 1,
                        "price": body.total_amount,
                        "amount": body.total_amount
                    }
                ],
                payment: {
                    checkout_link: '',
                    checkout_ref: '',
                    payment_date: expect.any(String),
                    payment_method: 'wallet'
                }
            }
        })
    })
    test('Case get single bill status paid', async ({ request }) => {
        bill_number = generate_bill_ref_id();
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: 3000,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const body = {
            "ref_id": bill_number,
            "date": bill_date,
            "due_date": due_date, // due date 5 minutes later
            "description": "Session 100kwh",
            "currency": bill_currency,
            "total_amount": 3000,
            "customer_sync_code": customer_sync_code,
            "payment_method_token": '',
            "payment_to": To_cpode,
            "total_amount_khr": 3000,
            "hash": generateHash(new_hash_value),
            "details": [
                {
                    "item_name": "testing",
                    "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                    "quantity": 1,
                    "price": 3000,
                    "amount": 3000
                }
            ]
        }
        const push_bill_with_payment = await pushbillwithpayment(body);
        console.log('push_bill with payment Response:', push_bill_with_payment);
        const get_bill = await getsinglebill(bill_number);
        console.log('Bill response:', get_bill);
        expect(get_bill.code).toBe("000");
        expect(get_bill.message).toBe("Success");
        expect(get_bill).toMatchObject({
            code: '000',
            message: 'Success',
            message_kh: 'ជោគជ័យ',
            data: {
                ref_id: bill_number,
                date: expect.any(String),
                due_date: expect.any(String),
                description: expect.any(String),
                currency: body.currency,
                total_amount: 3000,
                customer_sync_code: customer_sync_code,
                bill_status: 'paid',
                details: [

                    {
                        "item_name": body.details[0].item_name,
                        "description": body.details[0].description,
                        "quantity": 1,
                        "price": body.total_amount,
                        "amount": body.total_amount
                    }
                ],
                payment: {
                    checkout_link: '',
                    checkout_ref: '',
                    payment_date: expect.any(String),
                    payment_method: 'wallet'
                }
            }
        })
    })
    test('Case get single bill status unpaid', async ({ request }) => {
        const customer_name = await generateCustomerName();
        const customer_sync_code = await generateSyncCode()
        bill_number = generate_bill_ref_id();
        const customer_data = {
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
        }
        const customer = await create_customer(customer_data);
        const new_hash_value = {
            ref_id: bill_number,
            date: bill_date,
            currency: bill_currency,
            total_amount: 12000,
            customer_sync_code: customer_sync_code,
            payment_to: To_cpode
        };
        const body = {
            "ref_id": bill_number,
            "date": bill_date,
            "due_date": due_date, // due date 5 minutes later
            "description": "Session 100kwh",
            "currency": bill_currency,
            "total_amount": 12000,
            "customer_sync_code": customer_sync_code,
            "payment_method_token": '',
            "payment_to": To_cpode,
            "total_amount_khr": 12000,
            "hash": generateHash(new_hash_value),
            "details": [
                {
                    "item_name": "testing",
                    "description": "ការប្រើប្រាស់ ថាមពលសាកថ្ម",
                    "quantity": 1,
                    "price": 12000,
                    "amount": 12000
                }
            ]
        }
        const push_bill_with_payment = await pushbillwithpayment(body);
        const get_bill = await getsinglebill(bill_number);
        //console.log(get_bill);
        expect(get_bill.code).toBe("000");
        expect(get_bill.message).toBe("Success");
        expect(get_bill).toMatchObject({
            code: '000',
            message: 'Success',
            message_kh: 'ជោគជ័យ',
            data: {
                ref_id: bill_number,
                date: expect.any(String),
                due_date: expect.any(String),
                description: expect.any(String),
                currency: body.currency,
                total_amount: 12000,
                customer_sync_code: customer_sync_code,
                bill_status: 'unpaid',
                details: [

                    {
                        "item_name": body.details[0].item_name,
                        "description": body.details[0].description,
                        "quantity": 1,
                        "price": body.total_amount,
                        "amount": body.total_amount
                    }
                ],
                payment: {
                    checkout_link: expect.any(String),
                    checkout_ref: expect.any(String),
                    payment_date: null,
                    payment_method: ''
                }
            }
        })
    })
});

test.describe('Get bill negative case', () => {
    test('case invalid bill_ref', async ({ request }) => {
        const bill_number = await generate_bill_ref_id();
        const get_bill = await getsinglebill(bill_number);
        expect(get_bill.code).toBe('324');
        expect(get_bill.message).toBe('Bill not found.');
        expect(get_bill).toMatchObject({
            "code": "324",
            "message": "Bill not found.",
            "message_kh": "វិក្កយបត្ររកមិនឃើញ។",
            "data": {
                "ref_id": "",
                "date": "0001-01-01T00:00:00",
                "due_date": "0001-01-01T00:00:00",
                "description": "",
                "currency": "",
                "total_amount": 0,
                "customer_sync_code": "",
                "bill_status": "",
                "details": [],
                "payment": {
                    "checkout_link": "",
                    "checkout_ref": "",
                    "payment_date": null,
                    "payment_method": ""
                }
            }
        })
    })
})
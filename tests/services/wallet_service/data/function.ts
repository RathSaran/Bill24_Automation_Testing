import { request as playwrightRequest } from '@playwright/test';
import CryptoJS from "crypto-js";
import { getAuthToken } from "../../merchat_authorization";


// Random customer sync code generator
function generateSyncCode(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
export { generateSyncCode };


// Random customer name generator
function generateCustomerName(): string {
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah', 'Ian', 'Jane','doe','smith','johnson','williams','brown','jones','garcia','miller','davis'];
    return names[Math.floor(Math.random() * names.length)];
}
export { generateCustomerName };



function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Using to Generat Hash for endpoint push billwith payment.
export function generateHash(requestBody: any): string {
    const hashToken = "5517c66231d5bbeaf40cab5c0ec4c1e56448baed"; // Biller token

    // Format the date
    const formattedDate = formatDate(requestBody.date);

    // Build message (same order as Postman)
    const message =
        requestBody.ref_id +
        formattedDate +
        requestBody.currency +
        requestBody.total_amount +
        requestBody.customer_sync_code +
        requestBody.payment_to;

    // HMAC SHA-512 hashing
    const hmac = CryptoJS.HmacSHA512(message, hashToken);

    // Base64 output
    const hash = CryptoJS.enc.Base64.stringify(hmac);

    // Log for debugging
    console.log("Generated HASH:", hash);
    console.log("Message String:", message);
    console.log("Formatted Date:", formattedDate);

    return hash;
}

export { formatDate };

// using to generate bill_ref
export function generate_bill_ref_id(): string {
    const prefix = "BILL_REF_";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return prefix + randomNum.toString();
}

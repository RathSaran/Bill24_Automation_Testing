import { test, expect } from "@playwright/test";
import * as CryptoJS from "crypto-js";
import { getAuthToken } from "../../../merchat_authorization";
import { log } from "console";

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Encrypt a plain text using AES-CBC with a key derived from HMAC-SHA256.
 */
function encryptHMACAES(plainText: string, secretKey: string): string {
  // Derive AES key
  const hmac = CryptoJS.HmacSHA256(secretKey, secretKey);
  const aesKey = hmac.toString(CryptoJS.enc.Hex).substring(0, 64); // 32 bytes (64 hex chars)

  // Generate random IV
  const iv = CryptoJS.lib.WordArray.random(16);

  // Encrypt plaintext
  const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Hex.parse(aesKey), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Combine IV and ciphertext
  const ivAndCiphertext = iv.concat(encrypted.ciphertext);

  // Encode to Base64
  return CryptoJS.enc.Base64.stringify(ivAndCiphertext);
}

/**
 * Decrypt a Base64 AES-CBC string using a key derived from HMAC-SHA256.
 */
function decryptHMACAES(encryptedText: string, secretKey: string): string {
  // Decode Base64 to WordArray
  const ivAndCiphertext = CryptoJS.enc.Base64.parse(encryptedText);

  // Extract IV (first 16 bytes) and ciphertext
  const iv = CryptoJS.lib.WordArray.create(ivAndCiphertext.words.slice(0, 4), 16);
  const ciphertext = CryptoJS.lib.WordArray.create(ivAndCiphertext.words.slice(4));

  // Derive AES key
  const hmac = CryptoJS.HmacSHA256(secretKey, CryptoJS.enc.Utf8.parse(secretKey));
  const aesKey = hmac.toString(CryptoJS.enc.Hex).substring(0, 64);

  // ✅ FIX: Properly create CipherParams object for TypeScript compatibility
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext,
  });

  // Decrypt using AES-CBC
  const decrypted = CryptoJS.AES.decrypt(
    cipherParams,
    CryptoJS.enc.Hex.parse(aesKey),
    {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  // Convert decrypted WordArray to UTF-8 string
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Shared secret key
const SECRET_KEY =
  "viGRVikFx9am8dvDELcKxKuQ157aawRqDk94a7EfhXA40TDJPrOICaQj99tAu6UG";

// Test data for top-up
let referrer_key = "4315";
let token_biller = "529404f1-e439-45ba-b3f2-cdd7dc3cc336";
let customer_sync_code = "VV0004";
let topup_amount = 12000;
let bank_token = "3c81cc406c554b7a90030efed8a4c23b";//AC bank




// Test top-up wallet API
test.describe("Wallet Top-up API Tests", () => {
  test("Get customer wallet details and perform encrypted top-up", async ({ request }) => {
    // Step 1: Get wallet details
    const merchant_token = await getAuthToken();
    const getWalletResponse = await request.post("/customer/get_customer_detail", {
      headers: {
        "Content-Type": "application/json",
        "X-Referrer-Key": referrer_key,
        "Authorization": `Bearer ${merchant_token}`,
      },
      data: { "sync_code": customer_sync_code },
    });

    const walletData = await getWalletResponse.json();
    // console.log("Wallet Data:", walletData);
    expect(getWalletResponse.ok()).toBeTruthy();
    const wallet_amount = walletData.data.walletBalances[0].balance;
    const wallet_id = walletData.data.walletBalances[0].id;
    console.log("Wallet ID:", wallet_id);

    // Step 2: Encrypt the payload for top-up
    interface Payload {
      id: string;
      amount: number;
    }

    const payload: Payload = { id: wallet_id, amount: topup_amount };
    const plainText = JSON.stringify(payload);

    const encryptedText = encryptHMACAES(plainText, SECRET_KEY);
    console.log("Encrypted Text:", encryptedText);

    // Step 3: Perform encrypted top-up
    const topUpResponse = await request.post("/instantpaymentsdk/wallet/topup", {
      headers: {
        "Content-Type": "application/json",
        "X-Referrer-Key": referrer_key,
        "token": token_biller,
      },
      data: { "encrypted": encryptedText },
    });
    expect(topUpResponse.ok()).toBeTruthy();
    const topUpJson = await topUpResponse.json();
    // console.log("Top-up Response:", topUpJson);
    let tran_id = "";
    // Step 4: Decrypt the API response if needed
    if (topUpJson.data?.encrypted) {
      const decrypted = decryptHMACAES(topUpJson.data.encrypted, SECRET_KEY);
      //console.log("Decrypted Response:", decrypted);

      try {
        const parsed = JSON.parse(decrypted);
        console.log("Transaction ID:", parsed.tran_id);
        tran_id = parsed.tran_id;
      } catch (err) {
        console.error("Failed to parse decrypted data:", err);
      }
    }
    const inquiryBody = {
      "identity_code": tran_id,
      "fee_channel": "MERCHANT",
    };

    const inquiryResponse = await request.post(process.env.PAYMENT_Inquiry!, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "token": bank_token,
      },
      data: inquiryBody,
    });
    expect(inquiryResponse.ok()).toBeTruthy();
    if (!inquiryResponse.ok()) {
      throw new Error(`❌ Payment inquiry failed: ${inquiryResponse.status()}`);
    }
    expect(inquiryResponse.ok()).toBeTruthy();
    //console.log("Inquiry Response Status:", await inquiryResponse.text());
    const inquiryJson = await inquiryResponse.text();
    const payment_token = JSON.parse(inquiryJson).data.transaction.payment_token;
    const fee_channel = JSON.parse(inquiryJson).data.transaction.fee_channel;
    const currency = JSON.parse(inquiryJson).data.transaction.currency;
    const original_amount = JSON.parse(inquiryJson).data.transaction.original_amount;
    const total_amount = JSON.parse(inquiryJson).data.transaction.total_amount;
    const confirmBody = {
      "identity_code": tran_id,
      "fee_channel": fee_channel,
      "bank_ref": tran_id,
      "bank_date": new Date().toISOString().split("T")[0],
      "original_amount": original_amount,
      "convenience_fee_amount": 0,
      "sponsor_fee_amount": 0,
      "total_amount": total_amount,
      "currency": currency,
      "description": "",
      "payment_token": payment_token,
      "payer_account_no": "0000294",
      "payer_account_name": "Customer",
      "payer_phone": "0888820521"
    }
    const confirmResponse = await request.post(process.env.PAYMENT_CONFIRMv3!, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "token": "3c81cc406c554b7a90030efed8a4c23b",
      },
      data: confirmBody,
    });
    const confirmJson = await confirmResponse.text();
    const confirmjsonmessage = JSON.parse(confirmJson).message;
    console.log("Confirm Response message:", confirmjsonmessage);
    //console.log("Confirm Response Body:", await confirmResponse.text());
    expect(confirmResponse.ok()).toBeTruthy();
    console.log("Waiting 12 seconds for Queue processing...");
    await wait(20000); // Wait for 20 seconds to ensure processing is complete
    const getnewamount = await request.post("/customer/get_customer_detail", {
      headers: {
        "Content-Type": "application/json",
        "X-Referrer-Key": referrer_key,
        "Authorization": `Bearer ${merchant_token}`,
      },
      data: { "sync_code": customer_sync_code },
    });
    expect(getnewamount.ok()).toBeTruthy();

    const newwalletData = await getnewamount.json();
    const new_wallet_amount = newwalletData.data.walletBalances[0].balance;
    expect(new_wallet_amount).toBe(wallet_amount + payload.amount);
  });
});
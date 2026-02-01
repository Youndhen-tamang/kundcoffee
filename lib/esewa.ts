import crypto from "crypto";

export const generateEsewaSignature = (amount: number, transactionUuid: string) => {
  const totalAmount = amount.toString();
  const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
  const secret = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";

  // The signature order MUST be exact: total_amount,transaction_uuid,product_code
  const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signatureString)
    .digest("base64");

  return {
    signature,
    product_code: productCode,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    gatewayUrl: process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  };
};

export const verifyEsewaSignature = (encodedData: string) => {
  try {
    const decodedBuffer = Buffer.from(encodedData, "base64");
    const decodedJson = JSON.parse(decodedBuffer.toString("utf-8"));
    
    // Re-calculate signature to verify
    const message = decodedJson.signed_field_names
      .split(",")
      .map((field: string) => `${field}=${decodedJson[field] || ""}`)
      .join(",");

    const generatedSignature = crypto
      .createHmac("sha256", process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q")
      .update(message)
      .digest("base64");

    if (generatedSignature !== decodedJson.signature) return null;

    return decodedJson;
  } catch (error) {
    return null;
  }
};
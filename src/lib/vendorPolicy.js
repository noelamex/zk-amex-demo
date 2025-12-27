// src/lib/vendorPolicy.js
export function getVendorPolicy() {
  return {
    domain: process.env.VENDOR_DOMAIN || "publix.com",
    purpose: process.env.VENDOR_PURPOSE || "age21",
    terminalId: process.env.VENDOR_TERMINAL_ID || "pos-001",
  };
}

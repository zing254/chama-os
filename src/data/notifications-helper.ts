export function sendSMS(phone: string, message: string): Promise<boolean> {
  console.log(`[SMS] To: ${phone}, Message: ${message}`);
  return Promise.resolve(true);
}

export function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  console.log(`[WhatsApp] To: ${phone}, Message: ${message}`);
  return Promise.resolve(true);
}

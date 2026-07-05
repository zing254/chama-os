interface WhatsAppPayload {
  to: string;
  message: string;
}

export async function sendWhatsAppMessage(
  payload: WhatsAppPayload,
  credentials: { username: string; apiKey: string }
): Promise<{ success: boolean; error?: string }> {
  const { to, message } = payload;
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('to', to);
  formData.append('message', message);

  try {
    const res = await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ApiKey': credentials.apiKey,
        'Accept': 'application/json',
      },
      body: formData.toString(),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('AT send error:', err);
      return { success: false, error: err };
    }
    return { success: true };
  } catch (e) {
    console.error('AT send exception:', e);
    return { success: false, error: String(e) };
  }
}

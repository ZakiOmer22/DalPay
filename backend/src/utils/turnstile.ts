const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY!;

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    // In dev, skip verification if key is not set
    if (process.env.NODE_ENV === 'development') return true;
    throw new Error('TURNSTILE_SECRET_KEY is not configured');
  }

  const formData = new URLSearchParams();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  const data = await result.json() as TurnstileResponse;
  return data.success;
}
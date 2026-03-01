const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token = getToken(), ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...rest, headers });
  } catch (e) {
    const msg = e instanceof TypeError && e.message === 'Failed to fetch'
      ? `Cannot reach the API at ${API}. Make sure the backend is running (e.g. npm run dev:api).`
      : (e instanceof Error ? e.message : 'Network error');
    throw new Error(msg);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  registerLawyer: (body: { name: string; email: string; password: string; enrollmentNo: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/register/lawyer', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: (refreshToken: string) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

export const usersApi = {
  me: () => api<{ id: string; name: string; email: string; role: string; credits: number; enrollmentNo?: string; lawyerVerificationStatus?: string }>('/users/me'),
};

export const searchApi = {
  search: (body: { query: string; court?: string; year?: number }) =>
    api<{
      searchId: string;
      query: string;
      creditsUsed: number;
      creditsRemaining: number;
      response: string;
      similarCases: Array<{ id: string; title: string; court: string; year: number; citation: string | null; pdfUrl: string | null; snippet?: string | null }>;
    }>('/search', { method: 'POST', body: JSON.stringify(body) }),
  history: (limit?: number) =>
    api<Array<{ id: string; query: string; creditsUsed: number; createdAt: string }>>(
      limit != null ? `/search/history?limit=${limit}` : '/search/history'
    ),
};

export const paymentsApi = {
  plans: () => api<Array<{ id: string; name: string; credits: number; amount: number; amountInPaise: number; keyId?: string }>>('/payments/plans'),
  createOrder: (planId: string) =>
    api<{ orderId: string; razorpayOrderId: string | null; amount: number; currency: string; planId: string; credits: number; keyId?: string }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),
  confirm: (paymentId: string, razorpayPaymentId: string, razorpayOrderId: string) =>
    api<{ success: boolean; creditsAdded: number }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId, razorpayPaymentId, razorpayOrderId }),
    }),
  history: () =>
    api<Array<{ id: string; amount: number; status: string; creditsAdded: number | null; plan: string | null; createdAt: string }>>('/payments/history'),
};

export const casesApi = {
  suggest: (q: string, court?: string, year?: string, limit?: number) => {
    const params = new URLSearchParams({ q });
    if (court) params.set('court', court);
    if (year) params.set('year', year);
    if (limit != null) params.set('limit', String(limit));
    return api<Array<{ id: string; title: string; court: string; year: number; citation: string | null }>>(`/cases/suggest?${params}`);
  },
};

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api/v1`;
  }
  return 'http://localhost:3001/api/v1';
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const res = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
      credentials: 'include',
    });
    if (!res.ok) return false;
    const resData = await res.json();
    const payload = resData?.data || resData;
    const token = payload?.accessToken;
    const newRefreshToken = payload?.refreshToken;
    if (token) {
      localStorage.setItem('accessToken', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token === 'undefined' || token === 'null') token = null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let res = await fetch(`${getApiUrl()}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401 && typeof window !== 'undefined' && path !== '/auth/login' && path !== '/auth/register') {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = localStorage.getItem('accessToken');
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
      res = await fetch(`${getApiUrl()}${path}`, { ...options, headers: newHeaders, credentials: 'include' });
    } else {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let rawMsg = err.message || err.error;
    if (Array.isArray(rawMsg)) rawMsg = rawMsg.join(', ');

    let userFriendlyMsg = typeof rawMsg === 'string' && rawMsg ? rawMsg : 'Ocorreu um erro na requisição';
    if (res.status === 429 || (typeof userFriendlyMsg === 'string' && (userFriendlyMsg.includes('Throttler') || userFriendlyMsg.includes('Too Many Requests')))) {
      userFriendlyMsg = 'Muitas tentativas em pouco tempo. Aguarde alguns instantes.';
    } else if (res.status === 401 && path === '/auth/login') {
      userFriendlyMsg = 'Email ou senha incorretos.';
    }
    throw new Error(userFriendlyMsg);
  }

  const resData = await res.json().catch(() => ({}));
  // Unwrap NestJS TransformInterceptor response: { data: ... }
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data !== undefined) {
    return resData.data;
  }
  return resData;
}

export const apiClient = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};

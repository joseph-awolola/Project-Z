const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function signup(userData) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function getMe(token) {
  const response = await fetch(`${API_URL}/api/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user");
  }

  return data;
}

export async function createBusiness(token, business) {
  const res = await fetch(`${API_URL}/api/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(business),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create business");
  return data;
}

export function subscribe(token, businessId, { signal } = {}) {
  return request(`/api/businesses/${encodeURIComponent(businessId)}/subscribe`, {
    token,
    method: "POST",
    signal,
  });
}

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function getBusinesses() {
  return request("/api/businesses");
}

export function getBusiness(businessId) {
  return request(`/api/businesses/${encodeURIComponent(businessId)}`);
}

export function getOwnerBusinesses(token) {
  return request("/api/owner/businesses", { token });
}

export function getOwnerMembers(token, businessId) {
  return request(`/api/owner/businesses/${encodeURIComponent(businessId)}/members`, { token });
}

export function getOwnerPayments(token, businessId) {
  return request(`/api/owner/businesses/${encodeURIComponent(businessId)}/payments`, { token });
}

export function getMySubscriptions(token) {
  return request("/api/subscriptions/mine", { token });
}

export function cancelSubscription(token, subscriptionId) {
  return request(`/api/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    token,
    method: "POST",
  });
}

export function updateBusiness(token, businessId, business) {
  return request(`/api/businesses/${encodeURIComponent(businessId)}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(business),
  });
}
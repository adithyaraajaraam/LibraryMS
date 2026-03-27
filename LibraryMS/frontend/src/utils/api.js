const BASE_URL = "http://localhost:5000/api";

// Main fetch wrapper — adds JWT header automatically
export async function apiCall(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Use server's error message if available
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

// Auth APIs
export const authAPI = {
  login: (email, password) =>
    apiCall("/auth/login", "POST", { email, password }),

  signup: (username, email, password) =>
    apiCall("/auth/signup", "POST", { username, email, password }),
};

// Books APIs
export const booksAPI = {
  getAll: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/books?${query}`, "GET", null, token);
  },
  add: (token, book) => apiCall("/books", "POST", book, token),
  update: (token, id, book) => apiCall(`/books/${id}`, "PUT", book, token),
  delete: (token, id) => apiCall(`/books/${id}`, "DELETE", null, token),
};

// Transactions APIs
export const txAPI = {
  myBooks: (token) => apiCall("/transactions/my", "GET", null, token),
  borrow: (token, bookId) => apiCall(`/transactions/borrow/${bookId}`, "POST", null, token),
  returnBook: (token, txId) => apiCall(`/transactions/return/${txId}`, "POST", null, token),
  all: (token) => apiCall("/transactions/all", "GET", null, token),
};

// Admin APIs
export const adminAPI = {
  stats: (token) => apiCall("/admin/stats", "GET", null, token),
  logs: (token, page = 1) => apiCall(`/admin/logs?page=${page}&limit=20`, "GET", null, token),
  users: (token) => apiCall("/admin/users", "GET", null, token),
};

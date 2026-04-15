import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AUTH_TOKEN_KEY = "token";
const AUTH_USER_KEY = "user";
const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use((res) => res, (err) => {
    if (err.response?.status === 401) {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
        window.location.href = "/login";
    }
    if (!err.response) {
        err.message = "Unable to connect to the server. Please make sure the backend is running on http://localhost:8000.";
    }
    return Promise.reject(err);
});
export default api;
// Auth
export const authAPI = {
    login: (email, password) => api.post("/api/auth/login", { email, password }),
    register: (data) => api.post("/api/auth/register", data),
    me: () => api.get("/api/auth/me"),
};
// Users
export const usersAPI = {
    updateProfile: (data) => api.put("/api/users/me", data),
    uploadPhoto: (file) => {
        const fd = new FormData();
        fd.append("file", file);
        return api.post("/api/users/me/photo", fd);
    },
    list: () => api.get("/api/users/"),
    create: (data) => api.post("/api/users/", data),
    delete: (id) => api.delete(`/api/users/${id}`),
};
// Exams
export const examsAPI = {
    list: () => api.get("/api/exams/"),
    get: (id) => api.get(`/api/exams/${id}`),
    getAdmin: (id) => api.get(`/api/exams/${id}/admin`),
    create: (data) => api.post("/api/exams/", data),
    update: (id, data) => api.put(`/api/exams/${id}`, data),
    delete: (id) => api.delete(`/api/exams/${id}`),
    submit: (id, answers) => api.post(`/api/exams/${id}/submit`, answers),
    myAttempts: () => api.get("/api/exams/attempts/me"),
    allAttempts: () => api.get("/api/exams/attempts/all"),
};
// Certificates
export const certificatesAPI = {
    mine: () => api.get("/api/certificates/me"),
    all: () => api.get("/api/certificates/all"),
    approve: (id) => api.post(`/api/certificates/${id}/approve`),
    download: (id) => api.get(`/api/certificates/${id}/download`, { responseType: "blob" }),
};
// Payments
export const paymentsAPI = {
    mine: () => api.get("/api/payments/me"),
    checkoutCertificate: (certificateId, provider) => api.post(`/api/payments/certificates/${certificateId}/checkout`, { provider }),
    downloadInvoice: (paymentId) => api.get(`/api/payments/${paymentId}/invoice`, { responseType: "blob" }),
    all: () => api.get("/api/payments/admin/all"),
};
// Dashboard
export const dashboardAPI = {
    me: () => api.get("/api/dashboard/me"),
    admin: () => api.get("/api/dashboard/admin"),
};

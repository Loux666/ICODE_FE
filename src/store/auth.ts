import { defineStore } from "pinia";
import axios from "axios";
import apiClient from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: (): { user: any | null; token: string; lastLoginErrorStatus: number | null } => ({
    user: (() => {
      try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    })(),
    token: localStorage.getItem("token") || "", // Lấy token từ kho nếu có
    // Record last login HTTP status code (e.g., 403 when OTP required)
    lastLoginErrorStatus: null as number | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token, // Check xem đã đăng nhập chưa
  },

  actions: {
    async login(formData: any) {
      try {
        // reset last error status
        this.lastLoginErrorStatus = null;
        // 1. Gọi API Login của ông
        const response = await apiClient.post("/login", formData);
        // API có thể trả về cấu trúc { success, data: { user, token } }
        const payload =
          response.data && response.data.data
            ? response.data.data
            : response.data;

        // 2. Lưu token vào State và LocalStorage
        this.token = payload.token || "";
        this.user = payload.user || null;
        // Normalize avatar: prefer `avatar_url` when provided by API
        if (this.user) {
          if (this.user.avatar_url) this.user.avatar = this.user.avatar_url;
        }
        localStorage.setItem("token", this.token);
        try {
          localStorage.setItem("user", JSON.stringify(this.user));
        } catch (e) {
          // ignore
        }

        // 3. Set default header cho axios (để các request sau tự có token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        return true;
      } catch (error: any) {
        console.error("Lỗi đăng nhập:", error);
        // capture HTTP status for caller to react (e.g., 403 -> OTP required)
        try {
          this.lastLoginErrorStatus = error?.response?.status || null;
        } catch (e) {
          this.lastLoginErrorStatus = null;
        }
        return false;
      }
    },

    async register(formData: any) {
      try {
        const response = await apiClient.post("/register", formData);

        // Nếu API trả token kèm theo, tự động lưu và đăng nhập
        const payload =
          response.data && response.data.data
            ? response.data.data
            : response.data;
        if (payload && payload.token) {
          this.token = payload.token;
          this.user = payload.user || null;
          if (this.user && this.user.avatar_url) this.user.avatar = this.user.avatar_url;
          localStorage.setItem("token", this.token);
          try {
            localStorage.setItem("user", JSON.stringify(this.user));
          } catch (e) {
            // ignore
          }
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${this.token}`;
        }

        return true;
      } catch (error: any) {
        console.error("Lỗi register:", error);
        return false;
      }
    },

    async updateProfile(data: { name?: string, avatar?: File | null }) {
      try {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.avatar) formData.append('avatar', data.avatar);

        // API: POST /me/update (multipart/form-data)
        const response = await apiClient.post("/me/update", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        const payload = response.data && response.data.data ? response.data.data : response.data;

        // Cập nhật lại user trong store
        if (payload.user) {
          this.user = payload.user;
          // Normalize avatar
          if (this.user.avatar_url) this.user.avatar = this.user.avatar_url;
          localStorage.setItem("user", JSON.stringify(this.user));
        }

        return true;
      } catch (error: any) {
        console.error("Lỗi cập nhật profile:", error);
        return false;
      }
    },

    async logout() {
      try {
        await apiClient.post("/logout");
      } catch (error: any) {
        console.log("Lỗi logout server, nhưng cứ logout client đi");
      } finally {
        this.token = "";
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }
    },

    // Fetch current user's profile from API and persist locally
    async fetchProfile() {
      try {
        const response = await apiClient.get('/me');
        const payload = response.data && response.data.data ? response.data.data : response.data;
        this.user = payload.user || null;
        if (this.user && this.user.avatar_url) this.user.avatar = this.user.avatar_url;
        try {
          localStorage.setItem('user', JSON.stringify(this.user));
        } catch (e) {
          // ignore
        }
        return this.user;
      } catch (error: any) {
        console.error('Lỗi lấy profile:', error);
        return null;
      }
    },

    // OAuth Login with Google
    async loginWithGoogle() {
      try {
        const { loginWithGoogle } = await import('@/utils/oauth-popup');
        const result = await loginWithGoogle();

        if (result.success && result.user) {
          // Update store state
          this.token = localStorage.getItem('token') || '';
          this.user = result.user;

          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

          return true;
        }
        return false;
      } catch (error: any) {
        console.error('Google login error:', error);
        return false;
      }
    },

    // OAuth Login with Facebook
    async loginWithFacebook() {
      try {
        const { loginWithFacebook } = await import('@/utils/oauth-popup');
        const result = await loginWithFacebook();

        if (result.success && result.user) {
          // Update store state
          this.token = localStorage.getItem('token') || '';
          this.user = result.user;

          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

          return true;
        }
        return false;
      } catch (error: any) {
        console.error('Facebook login error:', error);
        return false;
      }
    }
  },
});

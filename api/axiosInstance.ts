import axios from "axios"
import { API_BASE_URL, ROUTES } from "@/config/constants"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || "An error occurred"

    if (status === 401) {
      // Token expired or invalid
      useAuthStore.getState().clearAuth()
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.LOGIN
      }
      toast.error("Session expired. Please login again.")
    } else if (status === 403) {
      toast.error("You do not have permission to perform this action.")
    } else if (status === 404) {
      toast.error("Resource not found.")
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.")
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

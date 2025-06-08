// lib/toast.ts - Toast notification utilities
import toast, { Toaster, ToastOptions } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

// Default toast options
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#fff',
    color: '#333',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
}

// Custom toast with icons
export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      ...defaultOptions,
      icon: '✅',
      style: {
        ...defaultOptions.style,
        borderLeft: '4px solid #10b981',
      },
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      ...defaultOptions,
      icon: '❌',
      duration: 6000, // Errors stay longer
      style: {
        ...defaultOptions.style,
        borderLeft: '4px solid #ef4444',
      },
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultOptions,
      icon: '⚠️',
      style: {
        ...defaultOptions.style,
        borderLeft: '4px solid #f59e0b',
      },
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultOptions,
      icon: 'ℹ️',
      style: {
        ...defaultOptions.style,
        borderLeft: '4px solid #3b82f6',
      },
      ...options,
    }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, {
      ...defaultOptions,
      duration: Infinity, // Loading toasts don't auto-dismiss
      ...options,
    }),

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) =>
    toast.promise(promise, msgs, {
      ...defaultOptions,
      ...options,
      success: {
        ...defaultOptions,
        icon: '✅',
        style: {
          ...defaultOptions.style,
          borderLeft: '4px solid #10b981',
        },
      },
      error: {
        ...defaultOptions,
        icon: '❌',
        duration: 6000,
        style: {
          ...defaultOptions.style,
          borderLeft: '4px solid #ef4444',
        },
      },
      loading: {
        ...defaultOptions,
        icon: '⏳',
      },
    }),

  // Dismiss specific toast
  dismiss: (toastId?: string) => toast.dismiss(toastId),

  // Dismiss all toasts
  dismissAll: () => toast.dismiss(),
}

// Progress toast for long operations
export const showProgressToast = (message: string, progress: number) => {
  return toast(
    (t) => (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div className="flex-1">
          <div className="text-sm font-medium">{message}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</div>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      style: {
        ...defaultOptions.style,
        minWidth: '300px',
      },
    }
  )
}

// Achievement toast (special styling)
export const showAchievementToast = (
  title: string,
  description: string,
  xp: number
) => {
  return toast(
    (t) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            🏆
          </div>
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
          <div className="text-xs text-green-600 font-medium">+{xp} XP</div>
        </div>
      </div>
    ),
    {
      duration: 8000,
      style: {
        ...defaultOptions.style,
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #f59e0b',
        minWidth: '320px',
      },
    }
  )
}

// Toaster component with custom configuration
export const ToastProvider = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    gutter={8}
    containerClassName=""
    containerStyle={{}}
    toastOptions={{
      className: '',
      duration: 4000,
      style: {
        background: '#fff',
        color: '#333',
      },
    }}
  />
)
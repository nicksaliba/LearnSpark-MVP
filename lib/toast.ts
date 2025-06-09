// lib/toast.ts - Toast notification utilities (Fixed - No JSX)
import toast, { ToastOptions } from 'react-hot-toast'

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

// Progress toast for long operations (simplified without JSX)
export const showProgressToast = (message: string, progress: number) => {
  const progressText = `${message} - ${Math.round(progress)}%`
  return toast.loading(progressText, {
    duration: Infinity,
    style: {
      ...defaultOptions.style,
      minWidth: '300px',
    },
  })
}

// Achievement toast (simplified without JSX)
export const showAchievementToast = (
  title: string,
  description: string,
  xp: number
) => {
  const achievementText = `🏆 ${title}\n${description}\n+${xp} XP`
  return toast.success(achievementText, {
    duration: 8000,
    style: {
      ...defaultOptions.style,
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '2px solid #f59e0b',
      minWidth: '320px',
      whiteSpace: 'pre-line',
    },
  })
}

// Simple notification helpers
export const notify = {
  success: (message: string) => showToast.success(message),
  error: (message: string) => showToast.error(message),
  warning: (message: string) => showToast.warning(message),
  info: (message: string) => showToast.info(message),
  loading: (message: string) => showToast.loading(message),
}

// Progress update helper
export const updateProgressToast = (toastId: string, message: string, progress: number) => {
  toast.dismiss(toastId)
  return showProgressToast(message, progress)
}

// Achievement notification with confetti effect
export const celebrateAchievement = (title: string, description: string, xp: number) => {
  // Show the toast
  const toastId = showAchievementToast(title, description, xp)
  
  // Add some celebration logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎉 Achievement Unlocked: ${title} (+${xp} XP)`)
  }
  
  return toastId
}
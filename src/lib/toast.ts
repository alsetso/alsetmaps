import { toast } from 'sonner';

// Export the default toast function
export { toast };

// Success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 5000,
    position: 'top-center',
  });
};

// Error toast
export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 7000,
    position: 'top-center',
  });
};

// Info toast
export const showInfoToast = (message: string) => {
  toast.info(message, {
    duration: 4000,
    position: 'top-center',
  });
};

// Warning toast
export const showWarningToast = (message: string) => {
  toast.warning(message, {
    duration: 5000,
    position: 'top-center',
  });
};

// Loading toast
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
  });
};

// Dismiss toast
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

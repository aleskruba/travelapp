import { toast, Flip } from "react-toastify";

// Function for showing success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-left",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Flip,
  });
};

// Function for showing error toast
export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-left",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Flip,
  });
};

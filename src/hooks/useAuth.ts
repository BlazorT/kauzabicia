import { authService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";

export const useSignIn = () => {
  return useMutation({
    mutationFn: authService.signIn,
  });
};
export const useSignUp = () => {
  return useMutation({
    mutationFn: authService.signUp,
  });
};
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};
export const useUploadImage = () => {
  return useMutation({
    mutationFn: authService.uploadImage,
  });
};

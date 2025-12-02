import { UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseFormSubmissionOptions<TData, TResult = any> {
  mutation: UseMutationResult<TResult, any, TData>;
  successMessage: string;
  errorMessage?: string;
  onSuccess?: (result: TResult) => void;
}

export function useFormSubmission<TData, TResult = any>(
  options: UseFormSubmissionOptions<TData, TResult>
) {
  return async (data: TData) => {
    try {
      const result = await options.mutation.mutateAsync(data);
      toast.success(options.successMessage);
      options.onSuccess?.(result);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          options.errorMessage ||
          'Erro ao processar requisição'
      );
    }
  };
}

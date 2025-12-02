import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  ApiResponse,
  Customer,
  CustomersListResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
} from '@/types';

export function useCustomers(filters?: CustomerFilters) {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.name) params.append('name', filters.name);
  if (filters?.cpf) params.append('cpf', filters.cpf);
  if (filters?.riskCategory) params.append('riskCategory', filters.riskCategory);

  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async (): Promise<CustomersListResponse> => {
      const response = await api.get<ApiResponse<{ 
        data: Customer[]; 
        meta: { 
          total: number; 
          page: number; 
          limit: number; 
          totalPages: number 
        } 
      }>>(
        `/customer?${params.toString()}`
      );

      const { data, meta } = response.data.data;
      return {
        customers: data,
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.totalPages,
      };
    },
    staleTime: 0,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async (): Promise<Customer> => {
      const response = await api.get<ApiResponse<Customer>>(`/customer/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerRequest): Promise<Customer> => {
      const response = await api.post<ApiResponse<Customer>>('/customer', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCustomerRequest): Promise<Customer> => {
      const response = await api.patch<ApiResponse<Customer>>(
        `/customer/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/customer/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

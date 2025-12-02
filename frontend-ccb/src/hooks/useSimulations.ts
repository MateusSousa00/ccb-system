import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  ApiResponse,
  Simulation,
  SimulationsListResponse,
  CreateSimulationRequest,
  UpdateSimulationRequest,
  SimulationFilters,
} from '@/types';

export function useSimulations(filters?: SimulationFilters) {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.customerId) params.append('customerId', filters.customerId);
  if (filters?.status) params.append('status', filters.status);

  return useQuery({
    queryKey: ['simulations', filters],
    queryFn: async (): Promise<SimulationsListResponse> => {
      const response = await api.get<ApiResponse<{
         data: Simulation[]; 
         meta: { 
          total: number; 
          page: number; 
          limit: number; 
          totalPages: number 
        } 
      }>>(
        `/simulations?${params.toString()}`
      );
      const { data, meta } = response.data.data;
      return {
        simulations: data,
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.totalPages,
      };
    },
  });
}

export function useSimulation(id: string) {
  return useQuery({
    queryKey: ['simulation', id],
    queryFn: async (): Promise<Simulation> => {
      const response = await api.get<ApiResponse<Simulation>>(
        `/simulations/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateSimulationRequest
    ): Promise<Simulation> => {
      const response = await api.post<ApiResponse<{ message: string; simulation: Simulation }>>(
        '/simulations',
        data
      );
      return response.data.data.simulation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
}

export function useUpdateSimulation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateSimulationRequest
    ): Promise<Simulation> => {
      const response = await api.patch<ApiResponse<Simulation>>(
        `/simulations/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      queryClient.invalidateQueries({ queryKey: ['simulation', id] });
    },
  });
}

export function useDeleteSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/simulations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
}

export function useDownloadCCB() {
  return useMutation({
    mutationFn: async ({ id, customerName }: { id: string; customerName: string }): Promise<void> => {
      const response = await api.post(
        `/simulations/${id}/ccb`,
        {},
        {
          responseType: 'blob',
        }
      );

      const sanitizedName = customerName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();

      // Create download link
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CCB-${sanitizedName}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

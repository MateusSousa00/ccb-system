import { toast } from 'sonner';
import { useDownloadCCB, useUpdateSimulation } from './useSimulations';
import { SimulationStatus } from '@/types';

interface UseSimulationActionsOptions {
  simulationId: string;
  customerName?: string;
}

export function useSimulationActions({
  simulationId,
  customerName = 'Cliente',
}: UseSimulationActionsOptions) {
  const downloadCCB = useDownloadCCB();
  const updateSimulation = useUpdateSimulation(simulationId);

  const handleDownloadCCB = async () => {
    try {
      await downloadCCB.mutateAsync({
        id: simulationId,
        customerName,
      });
      toast.success('CCB baixado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao baixar CCB');
    }
  };

  const handleStatusChange = async (status: SimulationStatus) => {
    try {
      await updateSimulation.mutateAsync({ status });
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar status');
    }
  };

  return {
    handleDownloadCCB,
    handleStatusChange,
    isDownloading: downloadCCB.isPending,
    isUpdating: updateSimulation.isPending,
  };
}

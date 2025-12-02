'use client';

import { use } from 'react';
import { useSimulation } from '@/hooks/useSimulations';
import { useSimulationActions } from '@/hooks/useSimulationActions';
import { useUser } from '@/hooks/useAuth';
import { SimulationHeader } from '@/components/features/simulations/SimulationHeader';
import { CustomerInfoCard } from '@/components/features/simulations/CustomerInfoCard';
import { SimulationDetailsCard } from '@/components/features/simulations/SimulationDetailsCard';
import { FinancialDetailsCard } from '@/components/features/simulations/FinancialDetailsCard';
import { PaymentScheduleTable } from '@/components/features/simulations/PaymentScheduleTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { UserRole } from '@/types';

export default function SimulationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: simulation, isLoading, error } = useSimulation(id);
  const { data: user } = useUser();

  const { handleDownloadCCB, handleStatusChange, isDownloading, isUpdating } = useSimulationActions({
    simulationId: id,
    customerName: simulation?.customer?.name,
  });

  if (isLoading) return <LoadingState />;

  if (error || !simulation) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Erro ao carregar simulação</p>
      </div>
    );
  }

  const canUpdateStatus = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATOR;

  return (
    <div className="space-y-6">
      <SimulationHeader
        simulation={simulation}
        onDownload={handleDownloadCCB}
        isDownloading={isDownloading}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CustomerInfoCard customer={simulation.customer} />
        <SimulationDetailsCard
          simulation={simulation}
          canUpdateStatus={canUpdateStatus}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdating}
        />
      </div>

      <FinancialDetailsCard simulation={simulation} />
      <PaymentScheduleTable schedule={simulation.schedule} />
    </div>
  );
}

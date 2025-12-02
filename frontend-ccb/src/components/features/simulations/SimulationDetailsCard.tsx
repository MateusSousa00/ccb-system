import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { getStatusBadgeVariant, getStatusLabel } from '@/lib/badge-mappers';
import { SimulationStatus } from '@/types';
import type { Simulation } from '@/types';
import { StatusChangeConfirmation } from './StatusChangeConfirmation';

interface SimulationDetailsCardProps {
  simulation: Simulation;
  canUpdateStatus: boolean;
  onStatusChange: (status: SimulationStatus) => void;
  isUpdating?: boolean;
}

export function SimulationDetailsCard({
  simulation,
  canUpdateStatus,
  onStatusChange,
  isUpdating = false,
}: SimulationDetailsCardProps) {
  const [pendingStatus, setPendingStatus] = useState<SimulationStatus | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleStatusSelect = (value: string) => {
    setPendingStatus(value as SimulationStatus);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus);
      setConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Simulação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(simulation.status)}>
              {getStatusLabel(simulation.status)}
            </Badge>
            {canUpdateStatus && (
              <>
                <Select
                  value={simulation.status}
                  onValueChange={handleStatusSelect}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SimulationStatus.PENDING}>
                      Pendente
                    </SelectItem>
                    <SelectItem value={SimulationStatus.APPROVED}>
                      Aprovada
                    </SelectItem>
                    <SelectItem value={SimulationStatus.REJECTED}>
                      Rejeitada
                    </SelectItem>
                    <SelectItem value={SimulationStatus.CONVERTED}>
                      Convertida
                    </SelectItem>
                  </SelectContent>
                </Select>
                <StatusChangeConfirmation
                  open={confirmOpen}
                  onOpenChange={setConfirmOpen}
                  currentStatus={simulation.status}
                  newStatus={pendingStatus}
                  onConfirm={handleConfirm}
                  isLoading={isUpdating}
                />
              </>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Criado por</p>
          <p className="font-medium">{simulation.createdBy?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Data de Criação</p>
          <p className="font-medium">{formatDate(simulation.createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

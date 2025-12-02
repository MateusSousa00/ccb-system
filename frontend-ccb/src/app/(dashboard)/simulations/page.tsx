'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useSimulations } from '@/hooks/useSimulations';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SimulationStatus } from '@/types';

export default function SimulationsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useSimulations({ page, limit });

  const getStatusBadgeVariant = (status: SimulationStatus) => {
    switch (status) {
      case SimulationStatus.PENDING:
        return 'secondary';
      case SimulationStatus.APPROVED:
        return 'default';
      case SimulationStatus.REJECTED:
        return 'destructive';
      case SimulationStatus.CONVERTED:
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: SimulationStatus) => {
    switch (status) {
      case SimulationStatus.PENDING:
        return 'Pendente';
      case SimulationStatus.APPROVED:
        return 'Aprovada';
      case SimulationStatus.REJECTED:
        return 'Rejeitada';
      case SimulationStatus.CONVERTED:
        return 'Convertida';
      default:
        return status;
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Erro ao carregar simulações</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulações</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie as simulações de empréstimo
          </p>
        </div>
        <Link href="/simulations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Simulação
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : !data?.simulations || data.simulations.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <p className="text-gray-500">Nenhuma simulação cadastrada</p>
          <Link href="/simulations/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Simulação
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Solicitado</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.simulations.map((simulation) => (
                  <TableRow key={simulation.id}>
                    <TableCell className="font-medium">
                      {simulation.customer?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(simulation.requestedAmount)}
                    </TableCell>
                    <TableCell>{simulation.installments}x</TableCell>
                    <TableCell>
                      {formatCurrency(simulation.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(simulation.status)}>
                        {getStatusLabel(simulation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(simulation.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/simulations/${simulation.id}`}>
                        <Button variant="outline" size="sm">
                          Detalhes
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {data.simulations.length} de {data.total} simulações
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Página {page} de {data.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

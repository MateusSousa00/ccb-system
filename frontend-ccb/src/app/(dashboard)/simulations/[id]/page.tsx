'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useSimulation, useDownloadCCB, useUpdateSimulation } from '@/hooks/useSimulations';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SimulationStatus, UserRole } from '@/types';
import { useUser } from '@/hooks/useAuth';

export default function SimulationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: simulation, isLoading, error } = useSimulation(id);
  const { data: user } = useUser();
  const downloadCCB = useDownloadCCB();
  const updateSimulation = useUpdateSimulation(id);
  const [selectedStatus, setSelectedStatus] = useState<SimulationStatus | null>(null);

  const handleDownloadCCB = async () => {
    try {
      await downloadCCB.mutateAsync({
        id,
        customerName: simulation?.customer?.name || 'Cliente',
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
      setSelectedStatus(null);
    } catch (error: any) {
      toast.error('Erro ao atualizar status');
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/simulations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes da Simulação
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Simulação #{simulation.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadCCB} disabled={downloadCCB.isPending}>
          <Download className="mr-2 h-4 w-4" />
          {downloadCCB.isPending ? 'Baixando...' : 'Baixar CCB'}
        </Button>
      </div>

      {/* Simulation Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium">{simulation.customer?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CPF</p>
              <p className="font-medium">{simulation.customer?.cpf || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{simulation.customer?.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

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
                  <Select
                    value={selectedStatus || simulation.status}
                    onValueChange={(value) => handleStatusChange(value as SimulationStatus)}
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
      </div>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Valor Solicitado</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(simulation.requestedAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Juros</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatPercent(simulation.interestRate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de Parcelas</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {simulation.installments}x
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor da Parcela</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(simulation.installmentValue)}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-600">Total de Juros</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {formatCurrency(simulation.totalInterest)}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-600">Valor Total</p>
              <p className="mt-1 text-2xl font-bold text-green-900">
                {formatCurrency(simulation.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Amortização</CardTitle>
        </CardHeader>
        <CardContent>
          {simulation.schedule && simulation.schedule.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Juros</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.schedule.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">
                        {installment.installmentNumber}
                      </TableCell>
                      <TableCell>{formatDate(installment.dueDate)}</TableCell>
                      <TableCell>
                        {formatCurrency(installment.principal)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(installment.interest)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(installment.total)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(installment.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma tabela de amortização disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

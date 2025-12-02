import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getStatusBadgeVariant, getStatusLabel } from '@/lib/badge-mappers';
import type { Simulation } from '@/types';

interface SimulationsTableProps {
  simulations: Simulation[];
}

export function SimulationsTable({ simulations }: SimulationsTableProps) {
  return (
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
          {simulations.map((simulation) => (
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
  );
}

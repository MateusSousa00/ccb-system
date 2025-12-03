import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getStatusBadgeVariant, getStatusLabel } from '@/lib/badge-mappers';
import type { Simulation } from '@/types';

interface CustomerSimulationsSectionProps {
  simulations: Simulation[];
}

export function CustomerSimulationsSection({ simulations }: CustomerSimulationsSectionProps) {
  if (!simulations || simulations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simulações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este cliente ainda não possui simulações cadastradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulações do Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Valor Solicitado</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulations.map((simulation) => (
                <TableRow key={simulation.id}>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(simulation.status)}>
                      {getStatusLabel(simulation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(simulation.requestedAmount)}
                  </TableCell>
                  <TableCell>{simulation.installments}x</TableCell>
                  <TableCell>{formatCurrency(simulation.totalAmount)}</TableCell>
                  <TableCell>{formatDate(simulation.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/simulations/${simulation.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

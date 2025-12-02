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
import { formatCurrency, formatDate } from '@/lib/utils';
import type { InstallmentSchedule } from '@/types';

interface PaymentScheduleTableProps {
  schedule?: InstallmentSchedule[];
}

export function PaymentScheduleTable({ schedule }: PaymentScheduleTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Amortização</CardTitle>
      </CardHeader>
      <CardContent>
        {schedule && schedule.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Amortização</TableHead>
                  <TableHead>Juros</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((installment) => (
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
  );
}

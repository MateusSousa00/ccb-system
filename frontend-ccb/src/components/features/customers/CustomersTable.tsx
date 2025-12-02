import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCPF, formatCurrency, formatPercent } from '@/lib/utils';
import { getRiskBadgeVariant, getRiskLabel } from '@/lib/badge-mappers';
import type { Customer } from '@/types';

interface CustomersTableProps {
  customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Taxa de Juros</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Renda Mensal</TableHead>
            <TableHead>Risco</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{formatCPF(customer.cpf)}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{formatPercent(customer.interestRate)}</TableCell>
              <TableCell>{customer.creditScore}</TableCell>
              <TableCell>{formatCurrency(customer.monthlyIncome)}</TableCell>
              <TableCell>
                <Badge variant={getRiskBadgeVariant(customer.riskCategory)}>
                  {getRiskLabel(customer.riskCategory)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCPF, formatCurrency, formatPercent, formatDateTime } from '@/lib/utils';
import { getRiskBadgeVariant, getRiskLabel } from '@/lib/badge-mappers';
import type { Customer } from '@/types';

interface CustomerDetailsCardProps {
  customer: Customer;
}

export function CustomerDetailsCard({ customer }: CustomerDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nome Completo</p>
            <p className="font-medium">{customer.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">CPF</p>
            <p className="font-medium">{formatCPF(customer.cpf)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Telefone</p>
            <p className="font-medium">{customer.phone || 'Não informado'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Taxa de Juros</p>
            <p className="font-medium">{formatPercent(customer.interestRate)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Score de Crédito</p>
            <p className="font-medium">{customer.creditScore}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Renda Mensal</p>
            <p className="font-medium">{formatCurrency(customer.monthlyIncome)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Categoria de Risco</p>
            <Badge variant={getRiskBadgeVariant(customer.riskCategory)}>
              {getRiskLabel(customer.riskCategory)}
            </Badge>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Data de Cadastro</p>
            <p className="font-medium">{formatDateTime(customer.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

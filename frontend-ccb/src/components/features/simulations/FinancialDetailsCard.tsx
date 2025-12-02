import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { Simulation } from '@/types';

interface FinancialDetailsCardProps {
  simulation: Simulation;
}

export function FinancialDetailsCard({ simulation }: FinancialDetailsCardProps) {
  return (
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
  );
}

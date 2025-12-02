import { formatPercent } from '@/lib/utils';

interface CustomerSelectionCardProps {
  interestRate: number;
}

export function CustomerSelectionCard({
  interestRate,
}: CustomerSelectionCardProps) {
  return (
    <div className="rounded-lg border bg-blue-50 p-4">
      <p className="text-sm font-medium text-blue-900">
        Taxa de Juros do Cliente
      </p>
      <p className="mt-1 text-2xl font-bold text-blue-600">
        {formatPercent(interestRate)}
      </p>
      <p className="mt-1 text-xs text-blue-700">
        Esta taxa será aplicada automaticamente à simulação
      </p>
    </div>
  );
}

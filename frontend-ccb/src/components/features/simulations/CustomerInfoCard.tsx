import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Customer } from '@/types';

interface CustomerInfoCardProps {
  customer?: Customer;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm text-gray-600">Nome</p>
          <p className="font-medium">{customer?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">CPF</p>
          <p className="font-medium">{customer?.cpf || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium">{customer?.email || 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

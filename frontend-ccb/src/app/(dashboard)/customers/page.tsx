'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCPF, formatCurrency, formatPercent } from '@/lib/utils';
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
import { RiskCategory } from '@/types';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useCustomers({ page, limit });

  const getRiskBadgeVariant = (risk: RiskCategory) => {
    switch (risk) {
      case RiskCategory.LOW:
        return 'default';
      case RiskCategory.MEDIUM:
        return 'secondary';
      case RiskCategory.HIGH:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getRiskLabel = (risk: RiskCategory) => {
    switch (risk) {
      case RiskCategory.LOW:
        return 'Baixo';
      case RiskCategory.MEDIUM:
        return 'Médio';
      case RiskCategory.HIGH:
        return 'Alto';
      default:
        return risk;
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Erro ao carregar clientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie os clientes do sistema
          </p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : !data?.customers || data.customers.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <p className="text-gray-500">Nenhum cliente cadastrado</p>
          <Link href="/customers/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeiro Cliente
            </Button>
          </Link>
        </div>
      ) : (
        <>
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
                {data?.customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{formatCPF(customer.cpf)}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{formatPercent(customer.interestRate)}</TableCell>
                    <TableCell>{customer.creditScore}</TableCell>
                    <TableCell>
                      {formatCurrency(customer.monthlyIncome)}
                    </TableCell>
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

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {data.customers.length} de {data.total} clientes
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
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
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

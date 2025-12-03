'use client';

import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { RiskCategory } from '@/types';
import { maskCPF, maskPhone } from '@/lib/utils';
import { customerSchema } from '@/lib/schemas';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { NumberFormField, MaskedFormField, SelectFormField, FormActions } from '@/components/shared/form';
import type * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type CustomerForm = z.infer<typeof customerSchema>;

const riskOptions = [
  { value: RiskCategory.LOW, label: 'Baixo' },
  { value: RiskCategory.MEDIUM, label: 'Médio' },
  { value: RiskCategory.HIGH, label: 'Alto' },
];

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(id);
  const updateCustomer = useUpdateCustomer(id);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      cpf: customer?.cpf || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      interestRate: customer ? parseFloat(customer.interestRate) : 0,
      creditScore: customer?.creditScore || 0,
      monthlyIncome: customer ? parseFloat(customer.monthlyIncome) : 0,
      riskCategory: customer?.riskCategory || RiskCategory.MEDIUM,
    },
  });

  const onSubmit = useFormSubmission({
    mutation: updateCustomer,
    successMessage: 'Cliente atualizado com sucesso!',
    onSuccess: () => router.push(`/customers/${id}`),
  });

  if (isLoading) return <LoadingState />;

  if (!customer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">Cliente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Cliente"
        description="Atualize os dados do cliente"
        backHref={`/customers/${id}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
          <CardDescription>Todos os campos são obrigatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MaskedFormField
                  control={form.control}
                  name="cpf"
                  label="CPF"
                  mask={maskCPF}
                  placeholder="000.000.000-00"
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="joao@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MaskedFormField
                  control={form.control}
                  name="phone"
                  label="Telefone"
                  mask={maskPhone}
                  placeholder="(11) 99999-9999"
                />

                <NumberFormField
                  control={form.control}
                  name="interestRate"
                  label="Taxa de Juros (%)"
                  placeholder="12.50"
                  step="0.01"
                  description="Taxa de juros mensal aplicada ao cliente"
                />

                <NumberFormField
                  control={form.control}
                  name="creditScore"
                  label="Score de Crédito"
                  placeholder="750"
                  description="Pontuação de crédito (0-1000)"
                />

                <NumberFormField
                  control={form.control}
                  name="monthlyIncome"
                  label="Renda Mensal (R$)"
                  placeholder="5000.00"
                  step="0.01"
                />

                <SelectFormField
                  control={form.control}
                  name="riskCategory"
                  label="Categoria de Risco"
                  options={riskOptions}
                  placeholder="Selecione o risco"
                />
              </div>

              <FormActions
                cancelHref={`/customers/${id}`}
                submitLabel="Salvar Alterações"
                loadingLabel="Salvando..."
                isPending={updateCustomer.isPending}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

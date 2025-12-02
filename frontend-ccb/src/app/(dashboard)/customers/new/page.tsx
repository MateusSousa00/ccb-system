'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { RiskCategory } from '@/types';
import { maskCPF, maskPhone } from '@/lib/utils';
import { customerSchema } from '@/lib/schemas';
import { PageHeader } from '@/components/shared/PageHeader';
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

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      phone: '',
      interestRate: 0,
      creditScore: 0,
      monthlyIncome: 0,
      riskCategory: RiskCategory.MEDIUM,
    },
  });

  const onSubmit = useFormSubmission({
    mutation: createCustomer,
    successMessage: 'Cliente cadastrado com sucesso!',
    onSuccess: () => router.push('/customers'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Cliente"
        description="Preencha os dados do cliente"
        backHref="/customers"
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
                cancelHref="/customers"
                submitLabel="Salvar Cliente"
                loadingLabel="Salvando..."
                isPending={createCustomer.isPending}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCreateSimulation } from '@/hooks/useSimulations';
import { useCustomers } from '@/hooks/useCustomers';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { simulationSchema } from '@/lib/schemas';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyFormState } from '@/components/shared/EmptyFormState';
import { CustomerSelectionCard } from '@/components/shared/CustomerSelectionCard';
import { NumberFormField, FormActions } from '@/components/shared/form';
import type * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SimulationForm = z.infer<typeof simulationSchema>;

export default function NewSimulationPage() {
  const router = useRouter();
  const createSimulation = useCreateSimulation();
  const { data: customersData, isLoading: loadingCustomers } = useCustomers({
    limit: 100,
  });

  const form = useForm<SimulationForm>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      customerId: '',
      requestedAmount: 0,
      installments: 12,
    },
  });

  const selectedCustomerId = form.watch('customerId');
  const selectedCustomer = customersData?.customers?.find(
    (c) => c.id === selectedCustomerId
  );

  const onSubmit = useFormSubmission({
    mutation: createSimulation,
    successMessage: 'Simulação criada com sucesso!',
    onSuccess: (result) => router.push(`/simulations/${result.id}`),
  });

  if (loadingCustomers) return <LoadingState message="Carregando clientes..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Simulação"
        description="Preencha os dados da simulação de empréstimo"
        backHref="/simulations"
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados da Simulação</CardTitle>
          <CardDescription>
            Selecione o cliente e preencha os valores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!customersData?.customers || customersData.customers.length === 0 ? (
            <EmptyFormState
              message="Nenhum cliente cadastrado. É necessário cadastrar clientes antes de criar simulações."
              actionLabel="Cadastrar Cliente"
              actionHref="/customers/new"
            />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customersData?.customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.cpf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCustomer && (
                  <CustomerSelectionCard interestRate={selectedCustomer.interestRate} />
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <NumberFormField
                    control={form.control}
                    name="requestedAmount"
                    label="Valor Solicitado (R$)"
                    placeholder="10000.00"
                    step="0.01"
                    description="Valor do empréstimo solicitado"
                  />

                  <NumberFormField
                    control={form.control}
                    name="installments"
                    label="Número de Parcelas"
                    placeholder="12"
                    description="Quantidade de parcelas (1-60)"
                  />
                </div>

                <FormActions
                  cancelHref="/simulations"
                  submitLabel="Criar Simulação"
                  loadingLabel="Criando..."
                  isPending={createSimulation.isPending}
                  disabled={!selectedCustomer}
                />
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

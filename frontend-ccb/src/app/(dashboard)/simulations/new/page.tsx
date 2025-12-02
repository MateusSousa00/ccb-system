'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateSimulation } from '@/hooks/useSimulations';
import { useCustomers } from '@/hooks/useCustomers';
import { formatPercent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const simulationSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  requestedAmount: z
    .number()
    .min(100, 'Valor mínimo de R$ 100')
    .max(1000000, 'Valor máximo de R$ 1.000.000'),
  installments: z
    .number()
    .int()
    .min(1, 'Mínimo de 1 parcela')
    .max(60, 'Máximo de 60 parcelas'),
});

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

  const onSubmit = async (data: SimulationForm) => {
    try {
      const result = await createSimulation.mutateAsync(data);
      toast.success('Simulação criada com sucesso!');
      router.push(`/simulations/${result.id}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Erro ao criar simulação'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/simulations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Simulação</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preencha os dados da simulação de empréstimo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Simulação</CardTitle>
          <CardDescription>
            Selecione o cliente e preencha os valores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCustomers ? (
            <p className="text-gray-500">Carregando clientes...</p>
          ) : !customersData?.customers || customersData.customers.length === 0 ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Nenhum cliente cadastrado. É necessário cadastrar clientes antes
                de criar simulações.
              </p>
              <Link href="/customers/new">
                <Button className="mt-4" size="sm">
                  Cadastrar Cliente
                </Button>
              </Link>
            </div>
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
                  <div className="rounded-lg border bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-900">
                      Taxa de Juros do Cliente
                    </p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">
                      {formatPercent(selectedCustomer.interestRate)}
                    </p>
                    <p className="mt-1 text-xs text-blue-700">
                      Esta taxa será aplicada automaticamente à simulação
                    </p>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="requestedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Solicitado (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="10000.00"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor do empréstimo solicitado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormDescription>
                          Quantidade de parcelas (1-60)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Link href="/simulations">
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createSimulation.isPending || !selectedCustomer}
                  >
                    {createSimulation.isPending
                      ? 'Criando...'
                      : 'Criar Simulação'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

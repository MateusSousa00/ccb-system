'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { RiskCategory } from '@/types';
import { maskCPF, maskPhone } from '@/lib/utils';
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

const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(14, 'Telefone inválido')
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (11) 98765-4321'),
  interestRate: z
    .number()
    .min(0, 'Taxa de juros deve ser maior que 0')
    .max(100, 'Taxa de juros deve ser menor que 100'),
  creditScore: z
    .number()
    .int()
    .min(0, 'Score deve ser maior que 0')
    .max(1000, 'Score deve ser menor que 1000'),
  monthlyIncome: z
    .number()
    .min(0, 'Renda mensal deve ser maior que 0'),
  riskCategory: z.nativeEnum(RiskCategory),
});

type CustomerForm = z.infer<typeof customerSchema>;

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

  const onSubmit = async (data: CustomerForm) => {
    try {
      // Send formatted CPF and phone to backend
      await createCustomer.mutateAsync(data);

      toast.success('Cliente cadastrado com sucesso!');
      router.push('/customers');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Erro ao cadastrar cliente'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preencha os dados do cliente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
          <CardDescription>
            Todos os campos são obrigatórios
          </CardDescription>
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

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(maskCPF(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="joao@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => {
                            field.onChange(maskPhone(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="12.50"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription>
                        Taxa de juros mensal aplicada ao cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score de Crédito</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="750"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription>
                        Pontuação de crédito (0-1000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renda Mensal (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="5000.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria de Risco</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o risco" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={RiskCategory.LOW}>
                            Baixo
                          </SelectItem>
                          <SelectItem value={RiskCategory.MEDIUM}>
                            Médio
                          </SelectItem>
                          <SelectItem value={RiskCategory.HIGH}>
                            Alto
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/customers">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

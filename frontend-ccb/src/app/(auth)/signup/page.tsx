'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type * as z from 'zod';
import { useRegister } from '@/hooks/useAuth';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { signupSchema } from '@/lib/schemas';
import { UserRole } from '@/types';
import { AuthCard } from '@/components/auth/AuthCard';
import { SelectFormField } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type SignupForm = z.infer<typeof signupSchema>;

const roleOptions = [
  { value: UserRole.OPERATOR, label: 'Operador' },
  { value: UserRole.ADMIN, label: 'Administrador' },
];

export default function SignupPage() {
  const register = useRegister();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.OPERATOR,
    },
  });

  const onSubmit = useFormSubmission({
    mutation: register,
    successMessage: 'Conta criada com sucesso!',
    errorMessage: 'Erro ao criar conta',
  });

  return (
    <AuthCard
      title="Criar Conta"
      description="Preencha os dados abaixo para criar sua conta"
      footerText="Já tem uma conta?"
      footerLinkText="Faça login"
      footerLinkHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
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
                    placeholder="seu@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectFormField
            control={form.control}
            name="role"
            label="Função"
            options={roleOptions}
            placeholder="Selecione uma função"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={register.isPending}
          >
            {register.isPending ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}

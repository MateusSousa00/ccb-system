'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type * as z from 'zod';
import { useLogin } from '@/hooks/useAuth';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { loginSchema } from '@/lib/schemas';
import { AuthCard } from '@/components/auth/AuthCard';
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

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useFormSubmission({
    mutation: login,
    successMessage: 'Login realizado com sucesso!',
    errorMessage: 'Erro ao fazer login',
  });

  return (
    <AuthCard
      title="Login"
      description="Entre com suas credenciais para acessar o sistema"
      footerText="Não tem uma conta?"
      footerLinkText="Cadastre-se"
      footerLinkHref="/signup"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button
            type="submit"
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}

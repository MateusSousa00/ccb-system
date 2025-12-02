import * as z from 'zod';
import { RiskCategory, UserRole } from '@/types';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const signupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.nativeEnum(UserRole).optional(),
});

export const customerSchema = z.object({
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
  monthlyIncome: z.number().min(0, 'Renda mensal deve ser maior que 0'),
  riskCategory: z.nativeEnum(RiskCategory),
});

export const simulationSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  requestedAmount: z
    .number()
    .min(100, 'Valor mínimo: R$ 100')
    .max(1000000, 'Valor máximo: R$ 1.000.000'),
  installments: z
    .number()
    .int()
    .min(1, 'Mínimo: 1 parcela')
    .max(60, 'Máximo: 60 parcelas'),
});

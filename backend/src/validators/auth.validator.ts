import { z } from 'zod';

/**
 * Validadores de Autenticação usando Zod
 * 
 * Este arquivo contém os schemas de validação para todas as operações
 * relacionadas à autenticação (login, registro, etc.)
 */

/**
 * Schema de validação para Login
 * 
 * Valida:
 * - email: deve ser uma string válida no formato de email
 * - password: deve ter no mínimo 6 caracteres
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email deve ser uma string'
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  password: z
    .string({
      required_error: 'Senha é obrigatória',
      invalid_type_error: 'Senha deve ser uma string'
    })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
});

/**
 * Schema de validação para Registro de Usuário
 * 
 * Valida:
 * - email: deve ser uma string válida no formato de email
 * - password: deve ter no mínimo 6 caracteres
 * - name: deve ser uma string com no mínimo 2 caracteres
 * - role: opcional, deve ser um dos valores permitidos
 */
export const registerSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório'
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  password: z
    .string({
      required_error: 'Senha é obrigatória'
    })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
  
  name: z
    .string({
      required_error: 'Nome é obrigatório'
    })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  
  role: z
    .enum(['admin', 'user', 'orcamentista', 'compras', 'gerente'], {
      errorMap: () => ({ message: 'Role inválido' })
    })
    .optional()
    .default('user')
});

/**
 * Schema de validação para Atualização de Senha
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: 'Senha atual é obrigatória'
    })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  
  newPassword: z
    .string({
      required_error: 'Nova senha é obrigatória'
    })
    .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
    .max(100, 'Nova senha muito longa')
});

// Tipos TypeScript derivados dos schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


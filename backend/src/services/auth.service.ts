import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from './jwt.service';

const prisma = new PrismaClient();

/**
 * Serviço de Autenticação
 * 
 * Centraliza toda a lógica de negócio relacionada à autenticação,
 * mantendo os controllers limpos e focados apenas em lidar com requisições HTTP.
 */

/**
 * Interface do resultado de autenticação
 */
export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Interface para criação de usuário
 */
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

/**
 * Autentica um usuário com email e senha
 * 
 * @param email - Email do usuário
 * @param password - Senha em texto plano
 * @returns Objeto com token JWT e dados do usuário
 * @throws Error com mensagem "Credenciais inválidas" se falhar
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await authenticateUser('user@s3e.com', '123456');
 *   console.log(result.token); // "eyJhbGci..."
 *   console.log(result.user);  // { id: "...", email: "...", ... }
 * } catch (error) {
 *   console.error('Login falhou:', error.message);
 * }
 * ```
 */
export const authenticateUser = async (
  email: string, 
  password: string
): Promise<AuthResult> => {
  // 1. Buscar usuário no banco de dados
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });

  // 2. Verificar se usuário existe e está ativo
  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  if (!user.active) {
    throw new Error('Usuário inativo. Entre em contato com o administrador.');
  }

  // 3. Comparar senha fornecida com o hash armazenado
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas');
  }

  // 4. Gerar token JWT
  const token = generateToken({ 
    id: user.id, 
    role: user.role 
  });

  // 5. Retornar token e dados do usuário (sem a senha)
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
};

/**
 * Registra um novo usuário no sistema
 * 
 * @param data - Dados do usuário a ser criado
 * @returns Objeto com token JWT e dados do usuário criado
 * @throws Error se o email já estiver cadastrado
 * 
 * @example
 * ```typescript
 * const result = await registerUser({
 *   email: 'novo@s3e.com',
 *   password: '123456',
 *   name: 'Novo Usuário',
 *   role: 'user'
 * });
 * ```
 */
export const registerUser = async (
  data: CreateUserData
): Promise<AuthResult> => {
  // 1. Verificar se o email já está cadastrado
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // 2. Hash da senha
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 3. Criar usuário no banco de dados
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'user'
    }
  });

  // 4. Gerar token JWT
  const token = generateToken({ 
    id: user.id, 
    role: user.role 
  });

  // 5. Retornar token e dados do usuário
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
};

/**
 * Busca informações de um usuário pelo ID
 * 
 * @param userId - ID do usuário
 * @returns Dados do usuário (sem senha)
 * @throws Error se usuário não for encontrado
 * 
 * @example
 * ```typescript
 * const user = await getUserById('user-123');
 * console.log(user.email);
 * ```
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      email: true, 
      name: true, 
      role: true, 
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
};

/**
 * Atualiza a senha de um usuário
 * 
 * @param userId - ID do usuário
 * @param currentPassword - Senha atual
 * @param newPassword - Nova senha
 * @throws Error se a senha atual estiver incorreta
 * 
 * @example
 * ```typescript
 * await updatePassword('user-123', 'senhaAtual', 'novaSenha123');
 * ```
 */
export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  // 1. Buscar usuário
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // 2. Verificar senha atual
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Senha atual incorreta');
  }

  // 3. Hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 4. Atualizar senha no banco
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

/**
 * Verifica se um email já está cadastrado
 * 
 * @param email - Email a ser verificado
 * @returns true se o email já existe, false caso contrário
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  return !!user;
};

/**
 * Busca todos os usuários ativos do sistema
 * 
 * @returns Lista de usuários (sem senha)
 * 
 * @example
 * ```typescript
 * const users = await getAllUsers();
 * console.log(users); // [{ id: "...", name: "...", ... }, ...]
 * ```
 */
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { 
      id: true, 
      email: true, 
      name: true, 
      role: true, 
      active: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { name: 'asc' }
  });

  return users;
};


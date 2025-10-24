import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware de Validação com Zod
 * 
 * Este middleware valida o corpo da requisição (req.body) usando schemas Zod.
 * Se a validação falhar, retorna erro 400 com detalhes dos campos inválidos.
 */

/**
 * Cria um middleware de validação para um schema Zod específico
 * 
 * @param schema - Schema Zod para validação
 * @returns Middleware Express que valida req.body
 * 
 * @example
 * ```typescript
 * import { validate } from '../middlewares/validate';
 * import { loginSchema } from '../validators/auth.validator';
 * 
 * router.post('/login', validate(loginSchema), loginController);
 * ```
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma o req.body usando o schema
      const validatedData = await schema.parseAsync(req.body);
      
      // Substitui req.body pelos dados validados e transformados
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatar erros do Zod de forma legível
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Erro de validação',
          details: errors
        });
      } else {
        // Erro inesperado
        res.status(500).json({
          error: 'Erro interno ao validar requisição'
        });
      }
    }
  };
};

/**
 * Middleware de validação para query params
 * 
 * @param schema - Schema Zod para validação
 * @returns Middleware Express que valida req.query
 * 
 * @example
 * ```typescript
 * router.get('/users', validateQuery(userQuerySchema), getUsersController);
 * ```
 */
export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Erro de validação nos parâmetros',
          details: errors
        });
      } else {
        res.status(500).json({
          error: 'Erro interno ao validar parâmetros'
        });
      }
    }
  };
};

/**
 * Middleware de validação para params da URL
 * 
 * @param schema - Schema Zod para validação
 * @returns Middleware Express que valida req.params
 * 
 * @example
 * ```typescript
 * router.get('/users/:id', validateParams(userIdSchema), getUserController);
 * ```
 */
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Erro de validação nos parâmetros da URL',
          details: errors
        });
      } else {
        res.status(500).json({
          error: 'Erro interno ao validar parâmetros da URL'
        });
      }
    }
  };
};


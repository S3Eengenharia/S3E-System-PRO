import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware para registrar logs de auditoria automaticamente
 * Registra todas as ações relevantes no sistema
 */
export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const user = (req as any).user;

  // Interceptar a resposta para registrar após o sucesso
  res.send = function (data: any): Response {
    // Restaurar função original
    res.send = originalSend;

    // Tentar registrar log (não bloqueia a resposta)
    (async () => {
      try {
        // Só registra se for método que modifica dados
        if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
          return;
        }

        // Extrair informações da requisição
        const action = mapMethodToAction(req.method);
        const entity = extractEntityFromPath(req.path);
        const entityId = req.params.id || extractIdFromBody(req.body);
        const description = generateDescription(req.method, entity, req.path);

        // Só registra se tiver action e description válidos
        if (action && description) {
          await prisma.auditLog.create({
            data: {
              userId: user?.userId,
              userName: user?.name,
              userRole: user?.role,
              action,
              entity,
              entityId,
              description,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              metadata: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode
              }
            }
          }).catch(err => {
            // Log silencioso - não deve quebrar a aplicação
            console.error('⚠️ Erro ao registrar audit log:', err);
          });
        }
      } catch (error) {
        // Falha silenciosa - não deve afetar a resposta
        console.error('⚠️ Erro no middleware de auditoria:', error);
      }
    })();

    // Enviar resposta original
    return originalSend.call(this, data);
  };

  next();
};

// Helper: Mapear método HTTP para ação
function mapMethodToAction(method: string): string {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT': return 'UPDATE';
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'ACTION';
  }
}

// Helper: Extrair entidade do caminho
function extractEntityFromPath(path: string): string | undefined {
  // Exemplo: /api/projetos/123 -> Projeto
  // Exemplo: /api/orcamentos -> Orcamento
  const parts = path.split('/').filter(Boolean);
  
  if (parts.length < 2) return undefined;
  
  const entityPath = parts[1]; // segunda parte após /api/
  
  const entityMap: Record<string, string> = {
    'projetos': 'Projeto',
    'orcamentos': 'Orcamento',
    'clientes': 'Cliente',
    'materiais': 'Material',
    'compras': 'Compra',
    'fornecedores': 'Fornecedor',
    'vendas': 'Venda',
    'obras': 'Obra',
    'equipes': 'Equipe',
    'usuarios': 'Usuario',
    'configuracoes': 'Configuracao'
  };
  
  return entityMap[entityPath] || entityPath;
}

// Helper: Extrair ID do body
function extractIdFromBody(body: any): string | undefined {
  if (!body) return undefined;
  return body.id || body._id || undefined;
}

// Helper: Gerar descrição da ação
function generateDescription(method: string, entity: string | undefined, path: string): string {
  const action = mapMethodToAction(method);
  
  if (!entity) {
    return `${action} em ${path}`;
  }
  
  switch (action) {
    case 'CREATE':
      return `Criou ${entity}`;
    case 'UPDATE':
      return `Atualizou ${entity}`;
    case 'DELETE':
      return `Excluiu ${entity}`;
    default:
      return `${action} em ${entity}`;
  }
}


// Sistema de Permissões RBAC - S3E Engenharia

export type UserRole = 
  | 'desenvolvedor' 
  | 'admin' 
  | 'gerente' 
  | 'comprador' 
  | 'engenheiro' 
  | 'eletricista';

export type Permission = 
  | 'view_logs'
  | 'view_financeiro'
  | 'view_nfe'
  | 'view_gerenciamento'
  | 'view_frota'
  | 'view_obras'
  | 'view_movimentacoes'
  | 'view_catalogo'
  | 'view_comparacao_precos'
  | 'view_projetos'
  | 'view_gestao_obras'
  | 'view_servicos'
  | 'view_vendas'
  | 'view_tarefas_obra'
  | 'create_material'
  | 'update_material'
  | 'delete_material'
  | 'deactivate_material'
  | 'create_projeto'
  | 'update_projeto'
  | 'delete_projeto'
  | 'deactivate_projeto'
  | 'create_servico'
  | 'update_servico'
  | 'delete_servico'
  | 'deactivate_servico'
  | 'create_orcamento'
  | 'update_orcamento'
  | 'delete_orcamento'
  | 'deactivate_orcamento'
  | 'create_kit'
  | 'update_kit'
  | 'delete_kit'
  | 'deactivate_kit'
  | 'create_obra'
  | 'update_obra'
  | 'delete_obra'
  | 'deactivate_obra'
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'universal_delete';

// Mapeamento de permissões por role
const rolePermissions: Record<UserRole, Permission[]> = {
  desenvolvedor: [
    // Acesso universal a TUDO
    'view_logs',
    'view_financeiro',
    'view_nfe',
    'view_gerenciamento',
    'view_frota',
    'view_obras',
    'view_movimentacoes',
    'view_catalogo',
    'view_comparacao_precos',
    'view_projetos',
    'view_gestao_obras',
    'view_servicos',
    'view_vendas',
    'view_tarefas_obra',
    // CRUD completo de tudo
    'create_material', 'update_material', 'delete_material', 'deactivate_material',
    'create_projeto', 'update_projeto', 'delete_projeto', 'deactivate_projeto',
    'create_servico', 'update_servico', 'delete_servico', 'deactivate_servico',
    'create_orcamento', 'update_orcamento', 'delete_orcamento', 'deactivate_orcamento',
    'create_kit', 'update_kit', 'delete_kit', 'deactivate_kit',
    'create_obra', 'update_obra', 'delete_obra', 'deactivate_obra',
    'create_user', 'update_user', 'delete_user',
    'universal_delete'
  ],
  
  admin: [
    // Acesso a tudo EXCETO logs
    'view_financeiro',
    'view_nfe',
    'view_gerenciamento',
    'view_frota',
    'view_obras',
    'view_movimentacoes',
    'view_catalogo',
    'view_comparacao_precos',
    'view_projetos',
    'view_gestao_obras',
    'view_servicos',
    'view_vendas',
    // CRUD completo
    'create_material', 'update_material', 'delete_material', 'deactivate_material',
    'create_projeto', 'update_projeto', 'delete_projeto', 'deactivate_projeto',
    'create_servico', 'update_servico', 'delete_servico', 'deactivate_servico',
    'create_orcamento', 'update_orcamento', 'delete_orcamento', 'deactivate_orcamento',
    'create_kit', 'update_kit', 'delete_kit', 'deactivate_kit',
    'create_obra', 'update_obra', 'delete_obra', 'deactivate_obra',
    'create_user', 'update_user', 'delete_user'
  ],
  
  gerente: [
    // Acesso a tudo EXCETO logs
    'view_financeiro',
    'view_nfe',
    'view_gerenciamento',
    'view_frota',
    'view_obras',
    'view_movimentacoes',
    'view_catalogo',
    'view_comparacao_precos',
    'view_projetos',
    'view_gestao_obras',
    'view_servicos',
    'view_vendas',
    // CRUD completo
    'create_material', 'update_material', 'delete_material', 'deactivate_material',
    'create_projeto', 'update_projeto', 'delete_projeto', 'deactivate_projeto',
    'create_servico', 'update_servico', 'delete_servico', 'deactivate_servico',
    'create_orcamento', 'update_orcamento', 'delete_orcamento', 'deactivate_orcamento',
    'create_kit', 'update_kit', 'delete_kit', 'deactivate_kit',
    'create_obra', 'update_obra', 'delete_obra', 'deactivate_obra',
    'create_user', 'update_user', 'delete_user'
  ],
  
  comprador: [
    // Acesso a quase tudo EXCETO Financeiro, NF-e
    // Em Gerenciamento Empresarial: apenas Frota
    'view_frota',
    'view_obras',
    'view_movimentacoes',
    'view_catalogo',
    'view_comparacao_precos',
    'view_projetos',
    'view_gestao_obras',
    'view_servicos',
    'view_vendas',
    // CRUD sem DELETE (apenas desativação)
    'create_material', 'update_material', 'deactivate_material',
    'create_projeto', 'update_projeto', 'deactivate_projeto',
    'create_servico', 'update_servico', 'deactivate_servico',
    'create_orcamento', 'update_orcamento', 'deactivate_orcamento',
    'create_kit', 'update_kit', 'deactivate_kit',
    'create_obra', 'update_obra', 'deactivate_obra'
  ],
  
  engenheiro: [
    // Acesso a quase tudo EXCETO Financeiro, NF-e, Gerenciamento Empresarial
    'view_obras',
    'view_movimentacoes',
    'view_catalogo',
    'view_comparacao_precos',
    'view_projetos',
    'view_gestao_obras',
    'view_servicos',
    'view_vendas',
    // CRUD sem DELETE (apenas desativação)
    'create_material', 'update_material', 'deactivate_material',
    'create_projeto', 'update_projeto', 'deactivate_projeto',
    'create_servico', 'update_servico', 'deactivate_servico',
    'create_orcamento', 'update_orcamento', 'deactivate_orcamento',
    'create_kit', 'update_kit', 'deactivate_kit',
    'create_obra', 'update_obra', 'deactivate_obra'
  ],
  
  eletricista: [
    // Acesso APENAS a Tarefas da Obra e Movimentações
    'view_tarefas_obra',
    'view_movimentacoes',
    // Apenas atualizar tarefas da obra
    'update_obra'
  ]
};

/**
 * Verifica se uma role tem uma permissão específica
 */
export function hasPermission(userRole: string | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  
  const normalizedRole = userRole.toLowerCase() as UserRole;
  const permissions = rolePermissions[normalizedRole];
  
  if (!permissions) return false;
  
  return permissions.includes(permission);
}

/**
 * Verifica se uma role tem TODAS as permissões especificadas
 */
export function hasAllPermissions(userRole: string | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Verifica se uma role tem PELO MENOS UMA das permissões especificadas
 */
export function hasAnyPermission(userRole: string | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Retorna todas as permissões de uma role
 */
export function getRolePermissions(userRole: string | undefined): Permission[] {
  if (!userRole) return [];
  
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return rolePermissions[normalizedRole] || [];
}

/**
 * Verifica se uma role pode deletar (vs apenas desativar)
 */
export function canDelete(userRole: string | undefined, entityType: 'material' | 'projeto' | 'servico' | 'orcamento' | 'kit' | 'obra' | 'user'): boolean {
  if (!userRole) return false;
  
  // Desenvolvedor tem permissão universal de delete
  if (hasPermission(userRole, 'universal_delete')) return true;
  
  // Admin e Gerente podem deletar
  const normalizedRole = userRole.toLowerCase();
  if (normalizedRole === 'admin' || normalizedRole === 'gerente') {
    return hasPermission(userRole, `delete_${entityType}` as Permission);
  }
  
  // Outras roles não podem deletar
  return false;
}

/**
 * Verifica se uma role pode apenas desativar (não deletar)
 */
export function canOnlyDeactivate(userRole: string | undefined, entityType: 'material' | 'projeto' | 'servico' | 'orcamento' | 'kit' | 'obra'): boolean {
  if (!userRole) return false;
  
  const normalizedRole = userRole.toLowerCase();
  
  // Comprador e Engenheiro podem apenas desativar
  if (normalizedRole === 'comprador' || normalizedRole === 'engenheiro') {
    return hasPermission(userRole, `deactivate_${entityType}` as Permission) && 
           !canDelete(userRole, entityType);
  }
  
  return false;
}

/**
 * Retorna o nome formatado da role
 */
export function getRoleName(role: string | undefined): string {
  if (!role) return 'Usuário';
  
  const roleNames: Record<string, string> = {
    desenvolvedor: 'Desenvolvedor',
    admin: 'Administrador',
    gerente: 'Gerente',
    comprador: 'Comprador',
    engenheiro: 'Engenheiro',
    eletricista: 'Eletricista'
  };
  
  return roleNames[role.toLowerCase()] || role;
}

/**
 * Retorna um emoji representativo da role
 */
export function getRoleEmoji(role: string | undefined): string {
  if (!role) return '👤';
  
  const roleEmojis: Record<string, string> = {
    desenvolvedor: '💻',
    admin: '👑',
    gerente: '📊',
    comprador: '🛒',
    engenheiro: '⚙️',
    eletricista: '⚡'
  };
  
  return roleEmojis[role.toLowerCase()] || '👤';
}


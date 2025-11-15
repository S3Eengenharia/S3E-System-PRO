/**
 * Utilitário para salvar e carregar o modo de visualização (grid/list) por página no localStorage
 */

export type ViewMode = 'grid' | 'list';

/**
 * Salva o modo de visualização para uma página específica
 */
export const saveViewMode = (pageName: string, viewMode: ViewMode): void => {
  try {
    const key = `viewMode_${pageName}`;
    localStorage.setItem(key, viewMode);
  } catch (error) {
    console.error('Erro ao salvar modo de visualização:', error);
  }
};

/**
 * Carrega o modo de visualização salvo para uma página específica
 * Retorna 'grid' como padrão se não houver valor salvo
 */
export const loadViewMode = (pageName: string): ViewMode => {
  try {
    const key = `viewMode_${pageName}`;
    const saved = localStorage.getItem(key);
    if (saved === 'grid' || saved === 'list') {
      return saved;
    }
  } catch (error) {
    console.error('Erro ao carregar modo de visualização:', error);
  }
  return 'grid'; // Padrão
};


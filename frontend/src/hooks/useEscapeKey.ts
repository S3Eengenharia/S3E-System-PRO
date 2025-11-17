import { useEffect } from 'react';

/**
 * Hook customizado para fechar modais ao pressionar ESC
 * @param isOpen - Estado que indica se o modal está aberto
 * @param onClose - Função para fechar o modal
 * @param enabled - Se o hook está habilitado (padrão: true)
 */
export function useEscapeKey(
  isOpen: boolean,
  onClose: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    // Adicionar listener quando o modal está aberto
    window.addEventListener('keydown', handleEscape);

    // Remover listener quando o modal fecha ou o componente desmonta
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, enabled]);
}


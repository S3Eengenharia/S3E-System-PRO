import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * ThemeToggle Component
 * Botão com dropdown para alternar entre Light, Dark e System theme
 * Integrado com o ThemeContext existente do projeto
 */
export function ThemeToggle() {
  const themeContext = useContext(ThemeContext);
  
  if (!themeContext) {
    return null;
  }
  
  const { setTheme } = themeContext;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-gray-300 dark:border-dark-border">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          ☀️ Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          🌙 Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          💻 Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

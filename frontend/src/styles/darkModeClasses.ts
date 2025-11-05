/**
 * Classes Tailwind padrão para Dark Mode
 * Reutilizar em todo o sistema para consistência
 */

export const darkModeClasses = {
  // Backgrounds
  page: 'bg-gray-50 dark:bg-dark-bg',
  card: 'bg-white dark:bg-dark-card',
  cardHeader: 'bg-white dark:bg-dark-card',
  section: 'bg-gray-50 dark:bg-dark-bg',
  
  // Borders
  border: 'border-gray-200 dark:border-dark-border',
  borderLight: 'border-gray-100 dark:border-dark-border/50',
  
  // Text
  title: 'text-gray-900 dark:text-dark-text',
  subtitle: 'text-gray-600 dark:text-dark-text-secondary',
  text: 'text-gray-700 dark:text-dark-text',
  textMuted: 'text-gray-500 dark:text-dark-text-secondary',
  
  // Inputs
  input: 'bg-white dark:bg-dark-bg border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-secondary',
  inputFocus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  
  // Buttons
  btnPrimary: 'bg-brand-blue hover:bg-brand-blue/90 text-white',
  btnSecondary: 'bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg',
  btnDanger: 'bg-red-600 hover:bg-red-700 text-white',
  
  // Modals
  modalOverlay: 'bg-black/70 dark:bg-black/80',
  modalContent: 'bg-white dark:bg-dark-card',
  modalHeader: 'bg-gradient-to-r from-blue-600 to-blue-700',
  
  // Tables
  tableHeader: 'bg-gray-50 dark:bg-dark-bg',
  tableRow: 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg',
  
  // Badges
  badgeGreen: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  badgeYellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  badgeRed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  badgeBlue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  badgeGray: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
};

/**
 * Função helper para combinar classes dark mode
 */
export const dm = (...classes: string[]) => classes.join(' ');


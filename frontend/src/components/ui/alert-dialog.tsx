import * as React from "react"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

export function AlertDialogContent({ children, className = "" }: AlertDialogContentProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 ${className}`}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{children}</h2>
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{children}</p>
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>
}

export function AlertDialogCancel({ children, onClick }: AlertDialogActionProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
    >
      {children}
    </button>
  )
}

export function AlertDialogAction({ children, onClick, className = "", ...props }: AlertDialogActionProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

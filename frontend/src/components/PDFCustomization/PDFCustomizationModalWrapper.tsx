import React from 'react';
import PDFCustomizationModal from './PDFCustomizationModal';
import { OrcamentoPDFData } from '../../types/pdfCustomization';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    orcamentoId: string;
    orcamentoData: OrcamentoPDFData;
    onGeneratePDF?: () => void;
}

class ErrorBoundary extends React.Component<
    { children: React.ReactNode; onError: (error: Error) => void },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('❌ Erro capturado no ErrorBoundary:', error, errorInfo);
        this.props.onError(error);
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

export const PDFCustomizationModalWrapper: React.FC<Props> = (props) => {
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const handleError = (error: Error) => {
        setErrorMessage(error.message || 'Erro desconhecido ao carregar o modal');
        console.error('Erro no modal de personalização:', error);
    };

    if (errorMessage) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Erro</h3>
                    <p className="text-gray-700 dark:text-dark-text mb-4">
                        Ocorreu um erro ao abrir o modal de personalização.
                    </p>
                    <pre className="bg-red-50 p-3 rounded text-xs text-red-800 mb-4 overflow-auto max-h-32">
                        {errorMessage}
                    </pre>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => {
                                setErrorMessage(null);
                                props.onClose();
                            }}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            Fechar
                        </button>
                        <button 
                            onClick={() => setErrorMessage(null)}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary onError={handleError}>
            <PDFCustomizationModal {...props} />
        </ErrorBoundary>
    );
};

export default PDFCustomizationModalWrapper;


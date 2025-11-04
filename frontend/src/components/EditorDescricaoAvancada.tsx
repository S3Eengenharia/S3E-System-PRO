import React, { useState, useCallback } from 'react';

// ==================== ICONS ====================
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M8.25 9h7.5" />
    </svg>
);

// ==================== TYPES ====================
interface Foto {
    id?: string;
    url: string;
    legenda: string;
    ordem: number;
    preview?: string; // Para preview local antes do upload
}

interface EditorDescricaoAvancadaProps {
    orcamentoTitulo: string;
    orcamentoCliente: string;
    descricaoInicial: string;
    fotosIniciais: Foto[];
    onSalvar: (descricao: string, fotos: Foto[]) => void;
    onVoltar: () => void;
}

// ==================== COMPONENT ====================
const EditorDescricaoAvancada: React.FC<EditorDescricaoAvancadaProps> = ({
    orcamentoTitulo,
    orcamentoCliente,
    descricaoInicial,
    fotosIniciais,
    onSalvar,
    onVoltar
}) => {
    const [descricao, setDescricao] = useState(descricaoInicial);
    const [fotos, setFotos] = useState<Foto[]>(fotosIniciais);
    const [isDragging, setIsDragging] = useState(false);

    // Handler para upload de fotos
    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;

        const newFotos: Foto[] = [];
        const maxOrdem = fotos.length > 0 ? Math.max(...fotos.map(f => f.ordem)) : 0;

        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = e.target?.result as string;
                    newFotos.push({
                        url: preview, // Temporário, será substituído por URL do servidor
                        legenda: file.name.split('.')[0],
                        ordem: maxOrdem + index + 1,
                        preview
                    });

                    if (newFotos.length === files.length) {
                        setFotos(prev => [...prev, ...newFotos]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }, [fotos]);

    // Drag and Drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Remover foto
    const handleRemoveFoto = (index: number) => {
        setFotos(prev => prev.filter((_, i) => i !== index));
    };

    // Atualizar legenda
    const handleUpdateLegenda = (index: number, legenda: string) => {
        setFotos(prev => prev.map((foto, i) => 
            i === index ? { ...foto, legenda } : foto
        ));
    };

    // Formatação de texto
    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = descricao.substring(start, end) || 'texto';
        const newText = descricao.substring(0, start) + prefix + selectedText + suffix + descricao.substring(end);
        
        setDescricao(newText);
        
        // Reposicionar cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }, 0);
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10 shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editor Avançado de Descrição</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {orcamentoTitulo} - {orcamentoCliente}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onVoltar}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => onSalvar(descricao, fotos)}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold"
                            >
                                Salvar e Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Editor de Texto */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                                Descrição Técnica do Projeto
                            </h2>
                        </div>

                        {/* Barra de Ferramentas Simples */}
                        <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <button
                                type="button"
                                onClick={() => insertFormatting('**', '**')}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                                title="Negrito"
                            >
                                <strong>B</strong>
                            </button>
                            <button
                                type="button"
                                onClick={() => insertFormatting('*', '*')}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm italic"
                                title="Itálico"
                            >
                                <em>I</em>
                            </button>
                            <button
                                type="button"
                                onClick={() => insertFormatting('\n• ', '')}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                title="Lista"
                            >
                                • Lista
                            </button>
                            <button
                                type="button"
                                onClick={() => insertFormatting('\n## ', '')}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                                title="Título"
                            >
                                H2
                            </button>
                        </div>

                        {/* Textarea */}
                        <textarea
                            id="editor-textarea"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                            placeholder="Digite a descrição técnica detalhada do projeto...&#10;&#10;Exemplo:&#10;## ESCOPO DO PROJETO&#10;• Instalação de quadro de distribuição&#10;• Cabeamento completo&#10;• Aterramento e SPDA&#10;&#10;## ESPECIFICAÇÕES TÉCNICAS&#10;**Tensão:** 220/380V&#10;**Potência:** 75kW&#10;**Norma:** NBR 5410"
                        />

                        <div className="mt-4 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="font-semibold text-blue-900 mb-1">💡 Dicas de Formatação:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• **texto** para <strong>negrito</strong></li>
                                <li>• *texto* para <em>itálico</em></li>
                                <li>• ## Título para títulos de seção</li>
                                <li>• • Item para lista com marcadores</li>
                            </ul>
                        </div>
                    </div>

                    {/* Galeria de Fotos */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <PhotoIcon className="w-6 h-6 text-purple-600" />
                                Fotos do Projeto ({fotos.length})
                            </h2>
                        </div>

                        {/* Área de Upload (Drag and Drop) */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all mb-6 ${
                                isDragging 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                            }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileSelect(e.target.files)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <PhotoIcon className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
                            <p className="text-gray-700 font-medium mb-1">
                                {isDragging ? 'Solte as imagens aqui!' : 'Arraste fotos ou clique para selecionar'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Suporta múltiplas imagens (JPG, PNG, WEBP)
                            </p>
                        </div>

                        {/* Grid de Fotos */}
                        {fotos.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Nenhuma foto adicionada</p>
                                <p className="text-sm text-gray-400 mt-1">Adicione fotos do local da obra para documentação</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                                {fotos.map((foto, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {/* Preview da Imagem */}
                                        <div className="relative aspect-video bg-gray-100">
                                            <img
                                                src={foto.preview || foto.url}
                                                alt={foto.legenda}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => handleRemoveFoto(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        
                                        {/* Legenda */}
                                        <div className="p-3">
                                            <input
                                                type="text"
                                                value={foto.legenda}
                                                onChange={(e) => handleUpdateLegenda(index, e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="Legenda da foto..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview da Descrição Formatada */}
                <div className="mt-6 bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Pré-visualização
                    </h2>
                    <div className="prose max-w-none">
                        {descricao.split('\n').map((linha, i) => {
                            // Processar formatação básica
                            let textoProcessado = linha;
                            
                            // Títulos
                            if (linha.startsWith('## ')) {
                                return <h2 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{linha.substring(3)}</h2>;
                            }
                            
                            // Negrito
                            textoProcessado = textoProcessado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            
                            // Itálico
                            textoProcessado = textoProcessado.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            
                            // Lista
                            if (linha.startsWith('• ')) {
                                return (
                                    <li key={i} className="ml-6 text-gray-700" dangerouslySetInnerHTML={{ __html: textoProcessado.substring(2) }} />
                                );
                            }
                            
                            // Parágrafo normal
                            return linha.trim() ? (
                                <p key={i} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: textoProcessado }} />
                            ) : (
                                <br key={i} />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorDescricaoAvancada;


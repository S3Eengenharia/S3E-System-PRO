import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite a descrição...",
  className = "",
  readOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState(value);
  const quillRef = useRef<ReactQuill>(null);

  // Sincronizar valor do modal com o valor externo quando modal abre
  useEffect(() => {
    if (isModalOpen) {
      setModalValue(value);
    }
  }, [isModalOpen, value]);

  // Configuração da toolbar customizada
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'list', 'bullet'
  ];

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    onChange(modalValue);
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalValue(value); // Restaurar valor original
    setIsModalOpen(false);
  };

  // Preview do texto formatado (remover tags HTML para preview)
  const getPreviewText = (html: string) => {
    if (!html) return placeholder;
    
    // Remover tags HTML e limitar a 100 caracteres
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 100 
      ? textContent.substring(0, 100) + '...' 
      : textContent || placeholder;
  };

  return (
    <>
      {/* Campo compacto com preview */}
      <div className={`relative ${className}`}>
        <div
          onClick={handleModalOpen}
          className="min-h-[80px] p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-s3e focus:ring-2 focus:ring-brand-s3e focus:border-transparent transition-colors"
        >
          <div className="text-gray-900 whitespace-pre-wrap">
            {getPreviewText(value)}
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            Clique para editar
          </div>
        </div>
        
        {/* Botão para abrir editor completo */}
        <button
          type="button"
          onClick={handleModalOpen}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-brand-s3e transition-colors"
          title="Abrir Editor Completo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Modal do Editor Completo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-scaleIn">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-brand-s3e to-[#0d2847] p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Editor de Descrição
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Use as ferramentas abaixo para formatar o texto
                  </p>
                </div>
                <button
                  onClick={handleModalCancel}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Área do Editor */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={modalValue}
                    onChange={setModalValue}
                    placeholder={placeholder}
                    modules={modules}
                    formats={formats}
                    readOnly={readOnly}
                    className="h-full"
                    style={{ height: 'calc(100% - 42px)' }} // Ajustar altura para toolbar
                  />
                </div>
                
                {/* Contador de caracteres */}
                <div className="mt-2 text-sm text-gray-500 text-right">
                  {modalValue.replace(/<[^>]*>/g, '').length} caracteres
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <strong>Dica:</strong> Use os títulos para seções, negrito para ênfase e listas para organizar itens.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleModalCancel}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleModalSave}
                  className="px-6 py-2 bg-brand-s3e text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Salvar e Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ql-editor {
          min-height: 300px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
        }
        
        .ql-container {
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
          font-size: 14px;
        }
        
        .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        
        .ql-toolbar button:hover {
          color: #0a1a2f;
        }
        
        .ql-toolbar button.ql-active {
          color: #0a1a2f;
          background-color: #e5e7eb;
        }
      `}</style>
    </>
  );
};

export default RichTextEditor;

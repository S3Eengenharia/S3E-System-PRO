import React, { useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { Jodit } from 'jodit';

interface JoditEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: number;
}

const JoditEditorComponent: React.FC<JoditEditorProps> = ({ 
    value, 
    onChange, 
    placeholder = 'Digite a descrição técnica do projeto...', 
    height = 500 
}) => {
    const editor = useRef(null);

    // Handler para eventos do editor
    const handleEditorEvents = (jodit: any) => {
        if (!jodit) return;
        
        // Evento quando fullscreen é ativado/desativado
        jodit.events.on('afterOpenFullSize', () => {
            console.log('✅ Fullscreen ativado');
            // Garantir que o elemento fullsize tenha z-index correto
            const fullsizeElement = document.querySelector('.jodit_fullsize');
            if (fullsizeElement) {
                (fullsizeElement as HTMLElement).style.zIndex = '999999';
            }
        });
        
        jodit.events.on('afterCloseFullSize', () => {
            console.log('✅ Fullscreen desativado');
        });
    };

    // Configuração customizada do Jodit para Engenharia Elétrica
    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder,
        height: height,
        minHeight: 400,
        
        // Toolbar
        toolbar: true,
        toolbarAdaptive: false,
        toolbarButtonSize: 'middle',
        showCharsCounter: false,
        showWordsCounter: true,
        showXPathInStatusbar: false,
        
        // Fullsize configuração (funciona dentro e fora de modais)
        globalFullSize: true, // ✅ Habilita fullscreen global quando botão é clicado
        fullsize: false, // ✅ NÃO inicia em fullscreen automaticamente
        
        // Paste
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_clear_html',
        
        // Upload de Imagens
        uploader: {
            insertImageAsBase64URI: true, // Por enquanto, usar base64 (pode mudar para upload server depois)
            imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
            filesVariableName: 'files',
            withCredentials: false,
            format: 'json',
            method: 'POST',
            prepareData: function (formData: FormData) {
                return formData;
            },
            isSuccess: function (resp: any) {
                return !resp.error;
            },
            getMessage: function (resp: any) {
                return resp.msg;
            },
            process: function (resp: any) {
                return {
                    files: resp.files || [],
                    path: '',
                    baseurl: '',
                    error: resp.error ? 1 : 0,
                    msg: resp.msg
                };
            },
            defaultHandlerSuccess: function (data: any, resp: any) {
                const files = data.files || [];
                if (files.length) {
                    const tagName = 'img';
                    const elm = this.selection.j.createInside.element(tagName);
                    elm.setAttribute('src', files[0]);
                    this.selection.insertImage(elm as HTMLImageElement);
                }
            },
            error: function (e: Error) {
                console.error('Erro no upload:', e);
            }
        },
        
        // Configuração de Imagem
        image: {
            editSrc: true,
            editTitle: true,
            editAlt: true,
            editClass: true,
            editStyle: true,
            editId: true,
            editBorderRadius: true,
            editMargins: true,
            editWidth: true,
            editHeight: true,
            resize: true,
            crop: false,
            resizeOptions: {
                showResizeHandles: true,
            }
        },
        
        // Botões da Toolbar Customizada
        buttons: [
            'source', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'fontsize', 'brush', 'paragraph', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'align', '|',
            'image', 'table', 'link', '|',
            'hr', 'symbols', '|',
            'undo', 'redo', '|',
            'preview', 'fullsize', 'print'
        ],
        
        // Buttons size
        buttonsXS: [
            'bold', 'italic', '|',
            'ul', 'ol', '|',
            'image', 'link', '|',
            'align', '|',
            'undo', 'redo'
        ],
        
        // Configurações de idioma
        language: 'pt_br',
        i18n: {
            pt_br: {
                'Type something': 'Digite a descrição técnica...',
                'Insert Image': 'Inserir Imagem',
                'Drop image': 'Solte a imagem aqui',
                'or click': 'ou clique para selecionar',
                'Alternative text': 'Texto alternativo',
                'Browse': 'Procurar',
                'Upload': 'Upload',
                'Background': 'Fundo',
                'Text': 'Texto',
                'Top': 'Superior',
                'Middle': 'Meio',
                'Bottom': 'Inferior',
                'Insert': 'Inserir',
                'Cancel': 'Cancelar',
                'Delete': 'Excluir',
                'Select': 'Selecionar'
            }
        },
        
        // Estilo
        theme: 'default',
        editorCssClass: 'jodit-wysiwyg-editor',
        
        // Outros
        allowTabNavigation: true,
        enter: 'P' as any,
        defaultMode: Jodit.MODE_WYSIWYG,
        useSplitMode: false,
        colors: {
            greyscale:  ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
            palette:    ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00F0F0', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
            full: [
                '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
                '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
                '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
                '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
                '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#733554',
                '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'
            ]
        }
    }), [placeholder, height]);

    return (
        <div className="jodit-container">
            <JoditEditor
                ref={editor}
                value={value}
                config={config}
                onBlur={(newContent) => onChange(newContent)}
                onChange={(newContent) => {}}
                tabIndex={1}
                // @ts-ignore
                onInit={(jodit: any) => handleEditorEvents(jodit)}
            />
            
            <style>{`
                .jodit-container {
                    border: 2px solid #e5e7eb;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .jodit-container:focus-within {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }
                
                /* Fullsize - Modo Tela Cheia */
                .jodit_fullsize,
                .jodit-container .jodit_fullsize,
                .jodit-container.jodit_fullsize {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 999999 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    border: none !important;
                    border-radius: 0 !important;
                    overflow: auto !important;
                }
                
                .jodit_fullsize .jodit-workplace,
                .jodit-container.jodit_fullsize .jodit-workplace {
                    height: calc(100vh - 42px) !important;
                    min-height: calc(100vh - 42px) !important;
                }
                
                .jodit_fullsize .jodit-wysiwyg,
                .jodit-container.jodit_fullsize .jodit-wysiwyg {
                    height: calc(100vh - 100px) !important;
                    min-height: calc(100vh - 100px) !important;
                    max-height: none !important;
                    padding: 2rem 4rem !important;
                }
                
                .jodit_fullsize .jodit-toolbar,
                .jodit-container.jodit_fullsize .jodit-toolbar {
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 10 !important;
                }
                
                .jodit_fullsize .jodit-status-bar,
                .jodit-container.jodit_fullsize .jodit-status-bar {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    z-index: 10 !important;
                }
                
                .jodit-wysiwyg {
                    padding: 1rem !important;
                    min-height: 400px !important;
                    font-family: system-ui, -apple-system, sans-serif !important;
                }
                
                .jodit-toolbar {
                    background: linear-gradient(to right, #f9fafb, #f3f4f6) !important;
                    border-bottom: 2px solid #e5e7eb !important;
                }
                
                .jodit-toolbar__box {
                    padding: 0.5rem !important;
                }
                
                /* Dark mode support */
                .dark .jodit-container {
                    border-color: #374151;
                }
                
                .dark .jodit_fullsize,
                .dark .jodit-container .jodit_fullsize,
                .dark .jodit-container.jodit_fullsize {
                    background: #111827 !important;
                }
                
                .dark .jodit-toolbar {
                    background: linear-gradient(to right, #1f2937, #111827) !important;
                    border-bottom-color: #374151 !important;
                }
                
                .dark .jodit-wysiwyg {
                    background-color: #1f2937 !important;
                    color: #f9fafb !important;
                }
                
                .dark .jodit-workplace {
                    background-color: #1f2937 !important;
                }
                
                .dark .jodit_fullsize .jodit-wysiwyg,
                .dark .jodit-container.jodit_fullsize .jodit-wysiwyg {
                    background-color: #111827 !important;
                    color: #f9fafb !important;
                }
                
                /* Imagens responsivas */
                .jodit-wysiwyg img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                }
                
                /* Tabelas estilizadas */
                .jodit-wysiwyg table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0;
                }
                
                .jodit-wysiwyg table td,
                .jodit-wysiwyg table th {
                    border: 1px solid #e5e7eb;
                    padding: 0.5rem;
                }
                
                .jodit-wysiwyg table th {
                    background-color: #f3f4f6;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default JoditEditorComponent;


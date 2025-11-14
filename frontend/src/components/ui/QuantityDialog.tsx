import React, { useState, useEffect } from 'react';

interface QuantityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
    itemName: string;
    maxQuantity?: number;
}

const QuantityDialog: React.FC<QuantityDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    maxQuantity
}) => {
    const [quantity, setQuantity] = useState('1');

    useEffect(() => {
        if (isOpen) {
            setQuantity('1');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const qty = parseFloat(quantity);
        if (qty > 0 && (!maxQuantity || qty <= maxQuantity)) {
            onConfirm(qty);
            onClose();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Quantidade do Item
                </h3>
                
                <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {itemName}
                    </p>
                    {maxQuantity && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Máximo disponível: {maxQuantity}
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Quantidade *
                    </label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-lg font-semibold"
                        placeholder="Ex: 1, 2.5, 10..."
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!quantity || parseFloat(quantity) <= 0}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuantityDialog;


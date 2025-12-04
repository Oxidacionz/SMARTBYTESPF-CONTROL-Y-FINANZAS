import React, { useState } from 'react';
import { FinancialGoal } from '../../../types';
import { X, Plus, DollarSign } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

interface ContributionModalProps {
    goal: FinancialGoal;
    onConfirm: (goalId: string, amount: number) => void;
    onClose: () => void;
    formatMoney: (amount: number, currency: string) => string;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
    goal,
    onConfirm,
    onClose,
    formatMoney
}) => {
    const [amount, setAmount] = useState('');
    const amountRemaining = goal.target_amount - goal.current_amount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contributionAmount = parseFloat(amount);
        if (contributionAmount > 0) {
            onConfirm(goal.id, contributionAmount);
            onClose();
        }
    };

    const quickAmounts = [
        { label: '25%', value: amountRemaining * 0.25 },
        { label: '50%', value: amountRemaining * 0.50 },
        { label: '100%', value: amountRemaining },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Plus size={24} />
                        Agregar Contribución
                    </h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Goal Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{goal.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                                <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                                    {formatMoney(goal.current_amount, goal.currency)}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Falta:</span>
                                <p className="font-mono font-semibold text-green-600 dark:text-green-400">
                                    {formatMoney(amountRemaining, goal.currency)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <Input
                        label="Monto a Contribuir"
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        icon={<DollarSign size={16} />}
                    />

                    {/* Quick Amounts */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Montos Rápidos:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {quickAmounts.map((quick) => (
                                <button
                                    key={quick.label}
                                    type="button"
                                    onClick={() => setAmount(quick.value.toFixed(2))}
                                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {quick.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Nuevo total: <span className="font-mono font-bold">
                                    {formatMoney(goal.current_amount + parseFloat(amount), goal.currency)}
                                </span>
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Progreso: {((goal.current_amount + parseFloat(amount)) / goal.target_amount * 100).toFixed(1)}%
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            fullWidth
                            icon={<Plus size={20} />}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Confirmar Contribución
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="px-6"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

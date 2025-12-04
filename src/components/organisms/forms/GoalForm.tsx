import React, { useState, useEffect } from 'react';
import { FinancialGoal, GoalType, Currency, ContributionFrequency } from '../../../types';
import { X, Save, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

interface GoalFormProps {
    onAdd?: (goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'status'>) => void;
    onEdit?: (goal: FinancialGoal) => void;
    initialData?: FinancialGoal;
    onClose: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onAdd, onEdit, initialData, onClose }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [goalType, setGoalType] = useState<GoalType>(initialData?.goal_type || 'savings');
    const [targetAmount, setTargetAmount] = useState(initialData?.target_amount.toString() || '');
    const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'USD');
    const [targetDate, setTargetDate] = useState(initialData?.target_date || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [autoContribute, setAutoContribute] = useState(initialData?.auto_contribute || false);
    const [contributionFrequency, setContributionFrequency] = useState<ContributionFrequency>(initialData?.contribution_frequency || 'monthly');
    const [contributionAmount, setContributionAmount] = useState(initialData?.contribution_amount?.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) return;

        const goalData = {
            name,
            description,
            goal_type: goalType,
            target_amount: parseFloat(targetAmount),
            currency,
            target_date: targetDate || undefined,
            category: category || undefined,
            auto_contribute: autoContribute,
            contribution_frequency: autoContribute ? contributionFrequency : undefined,
            contribution_amount: autoContribute && contributionAmount ? parseFloat(contributionAmount) : undefined,
        };

        if (initialData && onEdit) {
            onEdit({ ...initialData, ...goalData });
        } else if (onAdd) {
            onAdd({
                ...goalData,
                current_amount: 0,
                status: 'active'
            });
        }
        onClose();
    };

    const goalTypeOptions = [
        { value: 'savings', label: '💰 Ahorro General', icon: '💰' },
        { value: 'emergency_fund', label: '🆘 Fondo de Emergencia', icon: '🆘' },
        { value: 'specific_fund', label: '🎯 Fondo Específico', icon: '🎯' },
        { value: 'income', label: '📈 Meta de Ingresos', icon: '📈' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex justify-between items-center text-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Target size={24} />
                        {initialData ? 'Editar Meta' : 'Nueva Meta Financiera'}
                    </h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tipo de Meta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Meta
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {goalTypeOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setGoalType(option.value as GoalType)}
                                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${goalType === option.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-200 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <span className="text-2xl">{option.icon}</span>
                                    <span className="text-sm font-medium">{option.label.split(' ').slice(1).join(' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nombre */}
                    <Input
                        label="Nombre de la Meta"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Vacaciones en Europa, Fondo de Emergencia"
                    />

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción (Opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm min-h-[80px]"
                            placeholder="Describe tu meta..."
                        />
                    </div>

                    {/* Monto y Moneda */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Monto Objetivo"
                            type="number"
                            step="0.01"
                            required
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="0.00"
                            icon={<DollarSign size={16} />}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Moneda
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as Currency)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="VES">Bolívares (Bs.)</option>
                                <option value="EUR">Euros (€)</option>
                            </select>
                        </div>
                    </div>

                    {/* Fecha Objetivo */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <Calendar size={16} />
                            Fecha Objetivo (Opcional)
                        </label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm"
                        />
                    </div>

                    {/* Categoría */}
                    {goalType === 'specific_fund' && (
                        <Input
                            label="Categoría"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ej: Salud, Hobbies, Educación, Viajes"
                        />
                    )}

                    {/* Contribución Automática */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center mb-3">
                            <input
                                type="checkbox"
                                checked={autoContribute}
                                onChange={(e) => setAutoContribute(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <TrendingUp size={16} />
                                Configurar Contribución Automática
                            </label>
                        </div>

                        {autoContribute && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Frecuencia
                                    </label>
                                    <select
                                        value={contributionFrequency}
                                        onChange={(e) => setContributionFrequency(e.target.value as ContributionFrequency)}
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm"
                                    >
                                        <option value="daily">Diario</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensual</option>
                                    </select>
                                </div>
                                <Input
                                    label="Monto"
                                    type="number"
                                    step="0.01"
                                    value={contributionAmount}
                                    onChange={(e) => setContributionAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            fullWidth
                            icon={initialData ? <Save size={20} /> : <Target size={20} />}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {initialData ? 'Actualizar Meta' : 'Crear Meta'}
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

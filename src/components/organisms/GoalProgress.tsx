import React from 'react';
import { FinancialGoal } from '../../types';
import { Target, Calendar, TrendingUp, CheckCircle, Clock, Pause, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface GoalProgressProps {
    goal: FinancialGoal;
    formatMoney: (amount: number, currency: string) => string;
    onEdit: (goal: FinancialGoal) => void;
    onDelete: (id: string) => void;
    onAddContribution: (goal: FinancialGoal) => void;
    calculateProgress: (goal: FinancialGoal) => number;
    getDaysRemaining: (goal: FinancialGoal) => number | null;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
    goal,
    formatMoney,
    onEdit,
    onDelete,
    onAddContribution,
    calculateProgress,
    getDaysRemaining
}) => {
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal);
    const amountRemaining = goal.target_amount - goal.current_amount;

    const getStatusIcon = () => {
        switch (goal.status) {
            case 'completed':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'paused':
                return <Pause size={20} className="text-yellow-500" />;
            case 'cancelled':
                return <XCircle size={20} className="text-red-500" />;
            default:
                return <Target size={20} className="text-blue-500" />;
        }
    };

    const getStatusColor = () => {
        switch (goal.status) {
            case 'completed':
                return 'border-green-500';
            case 'paused':
                return 'border-yellow-500';
            case 'cancelled':
                return 'border-red-500';
            default:
                if (daysRemaining !== null && daysRemaining < 0) return 'border-orange-500';
                return 'border-blue-500';
        }
    };

    const getGoalTypeLabel = () => {
        switch (goal.goal_type) {
            case 'savings':
                return '💰 Ahorro';
            case 'emergency_fund':
                return '🆘 Emergencia';
            case 'specific_fund':
                return '🎯 Específico';
            case 'income':
                return '📈 Ingresos';
            default:
                return '🎯 Meta';
        }
    };

    const getProgressColor = () => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <Card className={`p-4 border-l-4 ${getStatusColor()} hover:shadow-lg transition-shadow`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon()}
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">{goal.name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            {getGoalTypeLabel()}
                        </span>
                        {goal.category && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {goal.category}
                            </span>
                        )}
                        {goal.status !== 'active' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${goal.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                    goal.status === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                }`}>
                                {goal.status === 'completed' ? 'Completada' :
                                    goal.status === 'paused' ? 'Pausada' : 'Cancelada'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    {goal.status === 'active' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="px-2 text-green-600 hover:text-green-700"
                            onClick={() => onAddContribution(goal)}
                            icon={<Plus size={14} />}
                            title="Agregar Contribución"
                        />
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="px-2"
                        onClick={() => onEdit(goal)}
                        icon={<Edit size={14} />}
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        className="px-2 hover:text-red-500"
                        onClick={() => onDelete(goal.id)}
                        icon={<Trash2 size={14} />}
                    />
                </div>
            </div>

            {/* Description */}
            {goal.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Progreso: {progress.toFixed(1)}%
                    </span>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {formatMoney(goal.current_amount, goal.currency)} / {formatMoney(goal.target_amount, goal.currency)}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full flex items-center justify-end pr-1`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                        {progress >= 10 && (
                            <span className="text-[10px] font-bold text-white">
                                {progress.toFixed(0)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Amount Remaining */}
                {goal.status === 'active' && amountRemaining > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <TrendingUp size={14} />
                        <div>
                            <div className="text-xs opacity-75">Falta</div>
                            <div className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                                {formatMoney(amountRemaining, goal.currency)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Days Remaining */}
                {daysRemaining !== null && goal.status === 'active' && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock size={14} />
                        <div>
                            <div className="text-xs opacity-75">
                                {daysRemaining >= 0 ? 'Quedan' : 'Vencida'}
                            </div>
                            <div className={`font-semibold ${daysRemaining < 0 ? 'text-red-600 dark:text-red-400' :
                                    daysRemaining < 30 ? 'text-orange-600 dark:text-orange-400' :
                                        'text-gray-800 dark:text-gray-200'
                                }`}>
                                {Math.abs(daysRemaining)} días
                            </div>
                        </div>
                    </div>
                )}

                {/* Target Date */}
                {goal.target_date && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <div>
                            <div className="text-xs opacity-75">Fecha Objetivo</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                                {new Date(goal.target_date).toLocaleDateString('es-VE', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Auto Contribution */}
                {goal.auto_contribute && goal.contribution_amount && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <TrendingUp size={14} />
                        <div>
                            <div className="text-xs opacity-75">Contribución Auto</div>
                            <div className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                                {formatMoney(goal.contribution_amount, goal.currency)}
                                <span className="text-xs ml-1">
                                    /{goal.contribution_frequency === 'daily' ? 'día' : goal.contribution_frequency === 'weekly' ? 'sem' : 'mes'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Completion Message */}
            {goal.status === 'completed' && goal.completed_at && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                        <CheckCircle size={16} />
                        ¡Meta completada el {new Date(goal.completed_at).toLocaleDateString('es-VE')}!
                    </p>
                </div>
            )}
        </Card>
    );
};

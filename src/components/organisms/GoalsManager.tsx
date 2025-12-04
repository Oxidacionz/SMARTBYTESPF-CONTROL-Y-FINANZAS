import React, { useState } from 'react';
import { FinancialGoal } from '../../types';
import { GoalProgress } from './GoalProgress';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Target, Plus, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface GoalsManagerProps {
    goals: FinancialGoal[];
    formatMoney: (amount: number, currency: string) => string;
    onAddGoal: () => void;
    onEditGoal: (goal: FinancialGoal) => void;
    onDeleteGoal: (id: string) => void;
    onAddContribution: (goal: FinancialGoal) => void;
    calculateProgress: (goal: FinancialGoal) => number;
    getDaysRemaining: (goal: FinancialGoal) => number | null;
}

export const GoalsManager: React.FC<GoalsManagerProps> = ({
    goals,
    formatMoney,
    onAddGoal,
    onEditGoal,
    onDeleteGoal,
    onAddContribution,
    calculateProgress,
    getDaysRemaining
}) => {
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

    const filteredGoals = goals.filter(goal => {
        if (filter === 'all') return true;
        if (filter === 'active') return goal.status === 'active';
        if (filter === 'completed') return goal.status === 'completed';
        return true;
    });

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Target size={28} className="text-blue-600" />
                        Mis Metas Financieras
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona y alcanza tus objetivos financieros
                    </p>
                </div>
                <Button
                    onClick={onAddGoal}
                    icon={<Plus size={20} />}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Nueva Meta
                </Button>
            </div>

            {/* Summary Cards */}
            {activeGoals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Target size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Metas Activas</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{activeGoals.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-l-4 border-green-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Completadas</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{completedGoals.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-l-4 border-purple-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Progreso General</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{overallProgress.toFixed(1)}%</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filter === 'active'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Activas ({activeGoals.length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filter === 'completed'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Completadas ({completedGoals.length})
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filter === 'all'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Todas ({goals.length})
                </button>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {filteredGoals.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <Target size={48} className="text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {filter === 'active' ? 'No tienes metas activas' :
                                        filter === 'completed' ? 'Aún no has completado ninguna meta' :
                                            'No tienes metas registradas'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Crea tu primera meta financiera y comienza a alcanzar tus objetivos
                                </p>
                                <Button
                                    onClick={onAddGoal}
                                    icon={<Plus size={20} />}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Crear Primera Meta
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    filteredGoals.map(goal => (
                        <GoalProgress
                            key={goal.id}
                            goal={goal}
                            formatMoney={formatMoney}
                            onEdit={onEditGoal}
                            onDelete={onDeleteGoal}
                            onAddContribution={onAddContribution}
                            calculateProgress={calculateProgress}
                            getDaysRemaining={getDaysRemaining}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

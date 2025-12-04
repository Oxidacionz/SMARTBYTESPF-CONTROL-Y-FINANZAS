import React from 'react';
import { UserFinancialProfile, FinancialRecommendation, BudgetDistribution } from '../../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, Shield, Target, ArrowRight, X } from 'lucide-react';

interface FinancialPlanDashboardProps {
    profile: UserFinancialProfile;
    recommendations: FinancialRecommendation[];
    budgetDistribution: BudgetDistribution;
    onEditProfile: () => void;
    onDismissRecommendation: (id: string) => void;
}

export const FinancialPlanDashboard: React.FC<FinancialPlanDashboardProps> = ({
    profile,
    recommendations,
    budgetDistribution,
    onEditProfile,
    onDismissRecommendation
}) => {

    const distributionData = [
        { name: 'Gastos', value: budgetDistribution.expenses, color: '#EF4444' }, // Red
        { name: 'Ahorro', value: budgetDistribution.savings, color: '#3B82F6' }, // Blue
        { name: 'Inversión', value: budgetDistribution.investment, color: '#10B981' }, // Green
        { name: 'Fondo Emergencia', value: budgetDistribution.emergency_fund || 0, color: '#F59E0B' }, // Orange
    ].filter(d => d.value > 0);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
            default: return 'border-gray-200';
        }
    };

    const getRecIcon = (type: string) => {
        switch (type) {
            case 'emergency_fund': return <Shield className="text-orange-500" />;
            case 'investment': return <TrendingUp className="text-green-500" />;
            case 'debt_reduction': return <AlertTriangle className="text-red-500" />;
            case 'savings_goal': return <Target className="text-blue-500" />;
            default: return <CheckCircle className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Plan Financiero Personalizado</h2>
                    <p className="text-gray-500 dark:text-gray-400">Basado en tu perfil {profile.risk_profile === 'conservative' ? 'Conservador' : profile.risk_profile === 'moderate' ? 'Moderado' : 'Arriesgado'}</p>
                </div>
                <Button onClick={onEditProfile} variant="secondary" icon={<ArrowRight size={16} />}>
                    Actualizar Perfil
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Distribución Recomendada */}
                <Card className="p-6 lg:col-span-1">
                    <h3 className="font-bold text-lg mb-4 text-center">Distribución Ideal de Ingresos</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
                            "Esta distribución está optimizada para tu edad ({profile.age} años) y perfil de riesgo."
                        </p>
                    </div>
                </Card>

                {/* Columna Derecha: Recomendaciones */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Target className="text-blue-600" />
                        Acciones Recomendadas ({recommendations.length})
                    </h3>

                    {recommendations.length === 0 ? (
                        <Card className="p-8 text-center bg-green-50 dark:bg-green-900/10 border-green-100">
                            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                            <h4 className="font-bold text-green-800 dark:text-green-300">¡Todo en orden!</h4>
                            <p className="text-green-600 dark:text-green-400">Tu salud financiera se ve excelente según tu perfil actual.</p>
                        </Card>
                    ) : (
                        recommendations.map(rec => (
                            <Card key={rec.id} className={`p-4 border-l-4 ${getPriorityColor(rec.priority)} relative group`}>
                                <button
                                    onClick={() => onDismissRecommendation(rec.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Descartar"
                                >
                                    <X size={16} />
                                </button>
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm h-fit">
                                        {getRecIcon(rec.recommendation_type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{rec.title}</h4>
                                            {rec.priority === 'high' && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Prioritario</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {rec.description}
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" className="text-xs h-8">Aplicar Recomendación</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Resumen del Perfil */}
            <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Resumen de tu Perfil</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="block text-gray-500 text-xs uppercase tracking-wider">Edad / Retiro</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.age} años / Meta: {profile.retirement_age_goal}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs uppercase tracking-wider">Perfil Riesgo</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{profile.risk_profile}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs uppercase tracking-wider">Familia</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.marital_status === 'married' ? 'Casado/a' : 'Soltero/a'}, {profile.num_children} hijos</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs uppercase tracking-wider">Fondo Emergencia</span>
                        <span className={`font-semibold ${profile.has_emergency_fund ? 'text-green-600' : 'text-red-500'}`}>
                            {profile.has_emergency_fund ? `${profile.emergency_fund_months} meses` : 'No tiene'}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

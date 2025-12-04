import React, { useState } from 'react';
import { UserFinancialProfile, MaritalStatus, WorkSchedule, IncomeRange, RetirementLifestyle, RiskProfile, InvestmentExperience } from '../../../types';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Card } from '../../atoms/Card';
import { User, Briefcase, Heart, TrendingUp, Shield, ArrowRight, ArrowLeft, Save, Check } from 'lucide-react';

interface FinancialProfileFormProps {
    initialData?: UserFinancialProfile;
    onSave: (profile: UserFinancialProfile) => void;
    onCancel: () => void;
}

export const FinancialProfileForm: React.FC<FinancialProfileFormProps> = ({ initialData, onSave, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<UserFinancialProfile>>(initialData || {});

    const updateField = (field: keyof UserFinancialProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as UserFinancialProfile);
    };

    const renderStepIndicator = () => (
        <div className="flex justify-between mb-8 px-4">
            {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`flex flex-col items-center ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${s === step ? 'bg-blue-600 text-white shadow-lg scale-110' :
                        s < step ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {s < step ? <Check size={16} /> : s}
                    </div>
                    <span className="text-xs font-medium hidden md:block">
                        {s === 1 ? 'Personal' : s === 2 ? 'Laboral' : s === 3 ? 'Estilo' : s === 4 ? 'Retiro' : 'Inversor'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="p-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Tu Perfil Financiero</h2>
                    <p className="text-gray-500 dark:text-gray-400">Ayúdanos a personalizar tus recomendaciones</p>
                </div>

                {renderStepIndicator()}

                <form onSubmit={handleSubmit} className="min-h-[300px]">
                    {/* Paso 1: Datos Personales */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600">
                                <User /> Datos Personales
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Edad"
                                    type="number"
                                    value={formData.age?.toString() || ''}
                                    onChange={e => updateField('age', parseInt(e.target.value))}
                                    placeholder="Ej: 30"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Civil</label>
                                    <select
                                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.marital_status || ''}
                                        onChange={e => updateField('marital_status', e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="single">Soltero/a</option>
                                        <option value="married">Casado/a</option>
                                        <option value="divorced">Divorciado/a</option>
                                        <option value="widowed">Viudo/a</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Hijos"
                                    type="number"
                                    value={formData.num_children?.toString() || '0'}
                                    onChange={e => updateField('num_children', parseInt(e.target.value))}
                                />
                                <Input
                                    label="Otros Dependientes"
                                    type="number"
                                    value={formData.num_dependents?.toString() || '0'}
                                    onChange={e => updateField('num_dependents', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Situación Laboral */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600">
                                <Briefcase /> Situación Laboral
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horario / Tipo de Trabajo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: 'full_time', label: 'Tiempo Completo' },
                                        { val: 'part_time', label: 'Medio Tiempo' },
                                        { val: 'freelance', label: 'Freelance / Independiente' },
                                        { val: 'student', label: 'Estudiante' },
                                        { val: 'retired', label: 'Jubilado' }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => updateField('work_schedule', opt.val)}
                                            className={`p-3 rounded-lg border text-sm transition-all ${formData.work_schedule === opt.val
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rango de Ingresos Mensuales</label>
                                <select
                                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.monthly_income_range || ''}
                                    onChange={e => updateField('monthly_income_range', e.target.value)}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="low">Bajo (Menos de $500)</option>
                                    <option value="medium">Medio ($500 - $2,000)</option>
                                    <option value="high">Alto ($2,000 - $5,000)</option>
                                    <option value="very_high">Muy Alto (Más de $5,000)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Estilo de Vida */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600">
                                <Heart /> Estilo de Vida
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hobbies e Intereses (Separados por coma)</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                                    rows={3}
                                    value={formData.hobbies?.join(', ') || ''}
                                    onChange={e => updateField('hobbies', e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="Ej: Viajes, Fotografía, Ciclismo, Lectura..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gastos Recurrentes Principales</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                                    rows={3}
                                    value={formData.main_expenses?.join(', ') || ''}
                                    onChange={e => updateField('main_expenses', e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="Ej: Alquiler, Colegio, Préstamo Auto..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 4: Planes de Retiro */}
                    {step === 4 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600">
                                <TrendingUp /> Planes de Retiro
                            </div>

                            <Input
                                label="Edad Deseada de Retiro"
                                type="number"
                                value={formData.retirement_age_goal?.toString() || ''}
                                onChange={e => updateField('retirement_age_goal', parseInt(e.target.value))}
                                placeholder="Ej: 60"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estilo de Vida Deseado en Retiro</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { val: 'modest', label: 'Modesto (Cubrir básicos)', desc: 'Vivir tranquilo con lo necesario' },
                                        { val: 'comfortable', label: 'Cómodo (Mantener nivel actual)', desc: 'Viajes ocasionales, sin preocupaciones' },
                                        { val: 'luxurious', label: 'Lujoso (Mejorar nivel)', desc: 'Viajes frecuentes, lujos, herencia' }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => updateField('retirement_lifestyle', opt.val)}
                                            className={`p-3 rounded-lg border text-left transition-all ${formData.retirement_lifestyle === opt.val
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`font-medium ${formData.retirement_lifestyle === opt.val ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</div>
                                            <div className="text-xs text-gray-500">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 5: Perfil de Inversor */}
                    {step === 5 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600">
                                <Shield /> Perfil de Inversor
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tolerancia al Riesgo</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'conservative', label: 'Conservador', icon: '🛡️' },
                                        { val: 'moderate', label: 'Moderado', icon: '⚖️' },
                                        { val: 'aggressive', label: 'Arriesgado', icon: '🚀' }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => updateField('risk_profile', opt.val)}
                                            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${formData.risk_profile === opt.val
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-2xl">{opt.icon}</span>
                                            <span className="text-sm font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experiencia en Inversiones</label>
                                <select
                                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.investment_experience || ''}
                                    onChange={e => updateField('investment_experience', e.target.value)}
                                >
                                    <option value="none">Ninguna</option>
                                    <option value="beginner">Principiante</option>
                                    <option value="intermediate">Intermedia</option>
                                    <option value="advanced">Avanzada</option>
                                </select>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.has_emergency_fund || false}
                                        onChange={e => updateField('has_emergency_fund', e.target.checked)}
                                        className="w-4 h-4 text-orange-600 rounded"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-800">¿Tienes Fondo de Emergencia?</label>
                                </div>
                                {formData.has_emergency_fund && (
                                    <Input
                                        label="Meses cubiertos"
                                        type="number"
                                        value={formData.emergency_fund_months?.toString() || ''}
                                        onChange={e => updateField('emergency_fund_months', parseInt(e.target.value))}
                                        placeholder="Ej: 3"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botones de Navegación */}
                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                        {step > 1 ? (
                            <Button type="button" variant="secondary" onClick={prevStep} icon={<ArrowLeft size={16} />}>
                                Anterior
                            </Button>
                        ) : (
                            <Button type="button" variant="ghost" onClick={onCancel}>
                                Cancelar
                            </Button>
                        )}

                        {step < 5 ? (
                            <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                                Siguiente <ArrowRight size={16} className="ml-2" />
                            </Button>
                        ) : (
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" icon={<Save size={16} />}>
                                Guardar Perfil
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
};

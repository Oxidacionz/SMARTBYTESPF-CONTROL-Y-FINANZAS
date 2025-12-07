import React, { useState, useEffect } from 'react';
import { Transaction, Currency } from '../../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { TrendingUp, TrendingDown, Clock, Search, Plus, DollarSign, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    formatMoney: (amount: number, currency: string) => string;
    isCompact?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const TransactionHistory: React.FC<Props> = ({ formatMoney, isCompact = false }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false); // Collapsed state for compact mode

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'INGRESO',
        amount: '',
        currency: 'USD',
        description: '',
        status: 'PENDIENTE'
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/transactions/`;
            if (filterType) url += `?type=${filterType}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/transactions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ type: 'INGRESO', amount: '', currency: 'USD', description: '', status: 'PENDIENTE' });
                fetchTransactions();
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'INGRESO': return <TrendingUp className="text-green-500" />;
            case 'GASTO': return <TrendingDown className="text-red-500" />;
            case 'CXC': return <DollarSign className="text-blue-500" />;
            case 'CXP': return <Clock className="text-orange-500" />;
            default: return <Clock />;
        }
    };

    if (isCompact) {
        return (
            <Card className="flex flex-col bg-slate-800 border border-amber-400 shadow-xl overflow-hidden transition-all duration-300">
                <div
                    className="p-3 border-b border-amber-400/30 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <h3 className="font-bold text-amber-100 flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-amber-400" />
                        Historial Reciente
                    </h3>
                    <div className="flex items-center gap-2">
                        {isCollapsed ? <TrendingDown size={14} className="text-amber-400" /> : <TrendingUp size={14} className="text-amber-400" />}
                    </div>
                </div>
                {!isCollapsed && (
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400"><RefreshCw className="animate-spin mx-auto mb-2" /></div>
                        ) : transactions.length > 0 ? (
                            transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-2 rounded bg-slate-700/30 border border-slate-700 hover:border-amber-400/30 transition-all group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                                            {getTypeIcon(tx.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-200 truncate w-24 group-hover:text-amber-200 transition-colors">{tx.description || tx.type}</p>
                                            <p className="text-[10px] text-slate-400">{tx.created_at ? format(new Date(tx.created_at), 'dd/MM HH:mm') : '-'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-bold ${tx.type === 'INGRESO' || tx.type === 'CXC' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'GASTO' || tx.type === 'CXP' ? '-' : '+'}{formatMoney(tx.amount, tx.currency)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-xs py-4">Sin movimientos recientes</p>
                        )}
                        <div className="pt-2 border-t border-slate-700/50 text-center">
                            <Button size="sm" variant="ghost" className="text-xs text-amber-400 hover:text-amber-300 w-full py-1 h-auto" onClick={fetchTransactions} icon={<RefreshCw size={12} />}>Actualizar</Button>
                        </div>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Operaciones</h2>
                <Button onClick={() => setShowForm(!showForm)} icon={<Plus size={16} />}>Nueva Operación</Button>
            </div>

            {showForm && (
                <Card className="p-6 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Registrar Operación</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="INGRESO">Ingreso (Lo que entra)</option>
                                    <option value="GASTO">Gasto (Lo que sale)</option>
                                    <option value="CXC">Deuda por Cobrar (Me deben)</option>
                                    <option value="CXP">Deuda por Pagar (Debo)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="VES">VES</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="COMPLETADO">Completado / Pagado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                            <textarea
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                    variant={filterType === null ? 'primary' : 'secondary'}
                    onClick={() => setFilterType(null)}
                    size="sm"
                >
                    Todos
                </Button>
                <Button
                    variant={filterType === 'INGRESO' ? 'primary' : 'secondary'}
                    onClick={() => setFilterType('INGRESO')}
                    size="sm"
                >
                    Ingresos
                </Button>
                <Button
                    variant={filterType === 'GASTO' ? 'primary' : 'secondary'}
                    onClick={() => setFilterType('GASTO')}
                    size="sm"
                >
                    Gastos
                </Button>
                <Button
                    variant={filterType === 'CXC' ? 'primary' : 'secondary'}
                    onClick={() => setFilterType('CXC')}
                    size="sm"
                >
                    Por Cobrar (Me deben)
                </Button>
                <Button
                    variant={filterType === 'CXP' ? 'primary' : 'secondary'}
                    onClick={() => setFilterType('CXP')}
                    size="sm"
                >
                    Por Pagar (Debo)
                </Button>
            </div>

            {/* Table */}
            <Card className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-gray-500"><RefreshCw className="animate-spin mx-auto mb-2" /> Cargando...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="p-4">Código / Fecha</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Descripción</th>
                                    <th className="p-4 text-right">Monto</th>
                                    <th className="p-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {transactions.length > 0 ? transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-mono text-xs">
                                            <div className="font-bold text-gray-900 dark:text-white">{tx.code}</div>
                                            <div className="text-gray-500 dark:text-gray-400">
                                                {tx.created_at ? format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm') : '-'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(tx.type)}
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {tx.description || '-'}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900 dark:text-white">
                                            {formatMoney(tx.amount, tx.currency)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No hay movimientos registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

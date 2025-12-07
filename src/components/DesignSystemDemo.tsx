import React, { useState } from 'react';
import { Card } from './atoms/Card';

export const DesignSystemDemo = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 space-y-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Design System: Navigation Proposals</h1>
                <p className="text-slate-400">Comparing interaction models for the primary action bar.</p>
            </header>

            {/* PROPUESTA 1: SMART DIAL */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-semibold text-blue-400">Propuesta 1: "The Smart Dial"</h2>
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">Minimalista / Dropdown</span>
                </div>
                <Card className="p-8 bg-slate-800 border border-slate-700 flex justify-center items-center h-48">
                    {/* Contenedor Navbar Simulado */}
                    <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl w-fit border border-slate-700/50 shadow-xl">
                        {/* 1. Botón Hormiga (Acción Rápida - Minimizado) */}
                        <button className="group flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-all border border-orange-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:scale-110 transition-transform"><path d="m19 5 3-3" /><path d="m2 22 3-3" /><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" /><path d="M7.5 13.5 12 9l8 8-4.5 4.5" /><path d="M16 13 8 5l2-2 11 11Z" /></svg>
                        </button>

                        {/* Separador Vertical Sutil */}
                        <div className="h-6 w-px bg-slate-700"></div>

                        {/* 2. Botón Principal Unificado (Dropdown Trigger) */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all font-medium text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                <span>Registrar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:rotate-180 transition-transform duration-300"><path d="m6 9 6 6 6-6" /></svg>
                            </button>

                            {/* Dropdown Menu (Visible on Group Hover for Demo) */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 transform origin-top-right">
                                <div className="p-1.5 space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-emerald-400 transition-colors text-sm text-left">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        + Tengo (Ingreso)
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-blue-400 transition-colors text-sm text-left">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        + Cobrar
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-indigo-400 transition-colors text-sm text-left">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        + Ahorro
                                    </button>
                                    <div className="h-px bg-slate-700/50 my-1"></div>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-red-400 transition-colors text-sm font-medium text-left">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                        - Gasto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* PROPUESTA 2: SEMANTIC SEGMENTED BAR */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-semibold text-emerald-400">Propuesta 2: "Semantic Segmented Bar"</h2>
                    <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">Recomendado / Técnico</span>
                </div>
                <Card className="p-8 bg-slate-800 border border-slate-700 flex justify-center items-center h-48">

                    <div className="flex items-center gap-3">
                        {/* Botón Hormiga Independiente (Estilo Tag) */}
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-950/30 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-900/40 hover:border-orange-500/40 transition-all text-xs font-medium uppercase tracking-wider">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            Hormiga
                        </button>

                        {/* Barra Segmentada Unificada */}
                        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-inner ring-1 ring-white/5">

                            {/* Grupo 1: Flujo de Caja (Tengo / Gasto) */}
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-transparent hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors text-xs font-semibold group border-r border-slate-700/50">
                                <span className="bg-emerald-500/20 text-emerald-500 rounded p-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors leading-none w-4 h-4 flex items-center justify-center">+</span>
                                Tengo
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-transparent hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors text-xs font-semibold group">
                                <span className="bg-red-500/20 text-red-500 rounded p-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors leading-none w-4 h-4 flex items-center justify-center">-</span>
                                Gasto
                            </button>

                            {/* Divisor */}
                            <div className="w-px h-4 bg-slate-600 mx-1"></div>

                            {/* Grupo 2: Gestión (Cobrar / Ahorro) - Solo Iconos */}
                            <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all" title="Cuentas por Cobrar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" x2="17" y1="11" y2="11" /></svg>
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-all" title="Ahorro / Metas">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                            </button>

                        </div>
                    </div>
                </Card>
            </section>

            {/* PROPUESTA 3: ACTION CHIPS */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-semibold text-purple-400">Propuesta 3: "The Action Chips"</h2>
                    <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">Dashboard / Visual</span>
                </div>
                <Card className="p-8 bg-slate-800 border border-slate-700 flex justify-center items-center h-48">
                    <div className="flex items-center gap-2">

                        {/* "Hormiga" */}
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 hover:border-orange-500 text-orange-500/80 hover:text-orange-400 rounded-md transition-all duration-300 text-xs font-bold uppercase">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" /><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L5 21l-3 1 1-3 2.1-2.1" /><path d="m15 9 6-6" /><path d="m22 2-3 3" /></svg>
                            Hormiga
                        </button>

                        <div className="w-px h-5 bg-slate-700 mx-1"></div>

                        {/* Grupo de Acciones - Estilo Chips "Glow" */}
                        {/* Ingreso */}
                        <button className="relative group px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:border-emerald-500/50 hover:bg-emerald-900/20 hover:shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-500 rounded-full p-0.5 group-hover:scale-110 transition-transform">
                                    <svg className="w-3 h-3 text-slate-900 font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14M5 12h14" /></svg>
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-400">Tengo</span>
                            </div>
                        </button>

                        {/* Cobrar */}
                        <button className="relative group px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:border-blue-500/50 hover:bg-blue-900/20 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-500 rounded-full p-0.5 group-hover:scale-110 transition-transform">
                                    <svg className="w-3 h-3 text-slate-900 font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14M5 12h14" /></svg>
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400">Cobrar</span>
                            </div>
                        </button>

                        {/* Gasto */}
                        <button className="relative group px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:border-red-500/50 hover:bg-red-900/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.15)] transition-all">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-500 rounded-full p-0.5 group-hover:scale-110 transition-transform">
                                    <svg className="w-3 h-3 text-slate-900 font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14" /></svg>
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-red-400">Gasto</span>
                            </div>
                        </button>

                        {/* Ahorro (Icono simple para cerrar) */}
                        <button className="p-2 rounded-full border border-slate-700 bg-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 text-slate-400 transition-all ml-1" title="Nuevo Ahorro">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h8v-3.03c.71.25 1.44.48 2.2.68 2.02.54 4-1 4-3.14V7" /></svg>
                        </button>

                    </div>
                </Card>
            </section>

            {/* PROPUESTA 4: UNIFIED COMMAND CENTER (ALL-IN-ONE) */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-semibold text-amber-400">Propuesta 4: "Unified Command Center"</h2>
                    <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">Solicitud Usuario / Full Integration</span>
                </div>
                <p className="text-sm text-slate-400">Fusiona la Navegación y las Acciones en una sola "Isla de Control" continua.</p>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl flex justify-center items-center overflow-x-auto">

                    {/* THE UNIFIED BAR */}
                    <div className="flex items-center bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden max-w-full">

                        {/* 1. SECCIÓN DE NAVEGACIÓN (Compacta) */}
                        <nav className="flex items-center gap-1 mr-4 overflow-x-auto no-scrollbar">
                            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20 text-xs font-medium whitespace-nowrap">Resumen</button>
                            <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-xs font-medium whitespace-nowrap transition-colors">Tengo/Me Deben</button>
                            <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-xs font-medium whitespace-nowrap transition-colors">Gasto/Deuda</button>
                            <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-xs font-medium whitespace-nowrap transition-colors">Metas</button>
                            <button className="hidden sm:block px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-xs font-medium whitespace-nowrap transition-colors">Inventario</button>
                        </nav>

                        {/* DIVIDER: "Separador de Contexto" */}
                        <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-500 to-transparent mx-2"></div>

                        {/* 2. SECCIÓN DE ACCIONES (Action Chips Integrados) */}
                        <div className="flex items-center gap-2 pl-2">
                            {/* Hormiga (Compacta) */}
                            <button className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-all" title="Gasto Hormiga">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            </button>

                            {/* + Tengo */}
                            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all group" title="Ingreso">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                            </button>

                            {/* - Gasto */}
                            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-red-500 text-red-500 hover:text-white transition-all group" title="Gasto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                            </button>

                            {/* Menú Más Acciones (Cobrar/Ahorro) para ahorrar espacio */}
                            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/30 hover:bg-slate-700 text-slate-400 transition-all" title="Más Acciones">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

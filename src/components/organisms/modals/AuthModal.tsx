import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Lock, Mail, Eye, EyeOff, Sun, Moon, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    darkMode?: boolean;
    toggleDarkMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ darkMode, toggleDarkMode }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMsg('');
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // El listener en App.tsx detectará la sesión y cerrará el modal automáticamente.
            } else {
                // REGISTRO
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (error) throw error;

                // LÓGICA DE PASE DIRECTO
                if (data.session) {
                    // Si Supabase devuelve sesión (Confirm Email desactivado), App.tsx lo maneja.
                    // No hacemos nada aquí, dejamos que el componente se desmonte.
                    return;
                } else if (data.user && !data.session) {
                    // Si hay usuario pero NO sesión, significa que Supabase está esperando confirmación de correo.
                    // Intentamos forzar el login por si acaso el usuario lo desactivó justo ahora.
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

                    if (loginData.session) {
                        return; // Entró directo
                    }

                    // Si falla el login automático, es porque la confirmación de correo sigue ACTIVA en Supabase.
                    setSuccessMsg("Cuenta registrada correctamente.");
                    setError("Para entrar directo, debes ir a Supabase > Auth > Providers > Email y DESACTIVAR 'Confirm Email'.");
                }
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            if (err.message.includes("Invalid login credentials")) {
                setError("Correo o contraseña incorrectos.");
            } else if (err.message.includes("already registered")) {
                setError("Este correo ya está registrado. Intenta iniciar sesión.");
            } else if (err.message.includes("Email not confirmed")) {
                setError("Tu correo no ha sido confirmado. Desactiva la confirmación en Supabase o revisa tu email.");
            } else {
                setError(err.message || 'Error de autenticación');
            }
        } finally {
            setLoading(false);
        }
    };


    const handleDemoLogin = () => {
        setLoading(true);

        try {
            // Activar modo demo local sin Supabase
            localStorage.setItem('demoMode', 'true');
            localStorage.setItem('demoStartTime', new Date().toISOString());

            // Crear sesión demo ficticia
            const demoSession = {
                user: {
                    id: 'demo-user',
                    email: 'demo@smartbytes.com',
                    user_metadata: { full_name: 'Usuario Demo' }
                }
            };

            // Guardar en sessionStorage para que persista durante la sesión
            sessionStorage.setItem('demoSession', JSON.stringify(demoSession));

            // Recargar para que App.tsx detecte el modo demo
            window.location.reload();
        } catch (err: any) {
            console.error("Demo Mode Error:", err);
            setError("Error activando modo demo");
            setLoading(false);
        }
    };

    const [triggerEffect, setTriggerEffect] = useState(false);

    const handleLogoClick = () => {
        setTriggerEffect(true);
        setTimeout(() => setTriggerEffect(false), 500);
    };

    // ... (rest of functions)

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-colors">
            <div className="relative w-full max-w-md">
                {/* Efecto de brillo animado en el borde */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-2xl opacity-75 blur ${triggerEffect ? 'opacity-100 blur-md duration-75' : 'animate-pulse transition-all duration-1000'}`}></div>

                <div className={`relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border-4 flex flex-col max-h-[90vh] shadow-amber-900/50 transition-all duration-300 ${triggerEffect ? 'border-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.5)] scale-[1.02]' : 'border-amber-500/60'}`}>

                    {/* Efecto de brillo metálico en las esquinas */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-tl-2xl pointer-events-none z-10"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-400/20 to-transparent rounded-br-2xl pointer-events-none z-10"></div>


                    <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 p-4 text-center relative shrink-0 border-b-2 border-amber-500/30">
                        <div className="flex justify-center mb-2">
                            <div
                                className={`relative cursor-pointer transition-transform duration-200 group ${triggerEffect ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
                                onClick={handleLogoClick}
                                title="SMART BYTES"
                            >
                                {/* Anillos metálicos con efecto de brillo */}
                                <div className="absolute inset-0 rounded-full ring-4 ring-slate-300/60 animate-pulse group-hover:ring-amber-400 transition-colors duration-500"></div>
                                <div className="absolute inset-0 rounded-full ring-2 ring-slate-100/40"></div>

                                <img
                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/logo.jpg`}
                                    onError={(e) => {
                                        // Si falla Supabase (bucket no creado o archivo no existe),
                                        // intentamos cargar el local como respaldo.
                                        const target = e.currentTarget;
                                        if (target.src.includes('storage')) {
                                            target.src = `${import.meta.env.BASE_URL}logo.jpg`;
                                        } else {
                                            // Si también falla el local, placeholder final
                                            target.onerror = null;
                                            target.src = "https://ui-avatars.com/api/?name=SB&background=f59e0b&color=fff&size=200";
                                        }
                                    }}
                                    alt="SMART BYTES.PF Logo"
                                    className="relative w-20 h-20 object-contain rounded-full shadow-2xl ring-4 ring-slate-400/90 group-hover:ring-amber-300 transition-all duration-500"
                                />

                                {/* Efecto de brillo metálico que se mueve */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-slate-300/20 animate-pulse"></div>
                                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 animate-shimmer-slow group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent mb-1 tracking-wide">SMART BYTES.PF</h1>
                        <p className="text-slate-300 text-[10px] font-medium tracking-wider">Control y Finanzas</p>
                    </div>

                    <div className="p-5 overflow-y-auto bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                        <h2 className="text-base font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent mb-3 text-center">
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h2>

                        {/* Mensaje de Éxito pero Bloqueo por Configuración */}
                        {successMsg && (
                            <div className="bg-green-900/30 border-2 border-green-500/50 rounded-xl p-2 mb-2 text-center backdrop-blur-sm">
                                <div className="flex justify-center mb-1 text-green-400">
                                    <CheckCircle size={20} />
                                </div>
                                <h3 className="font-bold text-green-300 mb-1 text-xs">¡Registrado!</h3>
                                <p className="text-[10px] text-green-200/80">
                                    Si no has entrado automáticamente, revisa el error abajo.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-2.5">
                            {!isLogin && (
                                <Input
                                    placeholder="Nombre Completo"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="pl-2 bg-white border-2 border-slate-600 text-gray-900 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 h-9 text-sm"
                                />
                            )}

                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-2.5 text-amber-400 z-10" />
                                <Input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-9 bg-white border-2 border-slate-600 text-gray-900 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 h-9 text-sm"
                                />
                            </div>

                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-2.5 text-amber-400 z-10" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-9 pr-9 bg-white border-2 border-slate-600 text-gray-900 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 h-9 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-amber-500 hover:text-amber-400 z-10 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            {isLogin && (
                                <div className="flex items-center justify-between text-[10px]">
                                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="rounded border-slate-600 bg-slate-900/50 text-amber-500 focus:ring-amber-500"
                                        />
                                        Recordar contraseña
                                    </label>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-900/30 text-red-300 p-2 rounded-lg text-[10px] flex items-start gap-1.5 border-2 border-red-500/50 backdrop-blur-sm">
                                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button fullWidth className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 h-9 text-sm shadow-lg shadow-amber-900/50 border-2 border-amber-400/30 text-slate-900 font-bold">
                                {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                                {!loading && <ArrowRight size={16} />}
                            </Button>
                        </form>

                        <div className="my-3 flex items-center gap-2">
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent flex-grow"></div>
                            <span className="text-[10px] text-amber-400/70 font-medium">O prueba</span>
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent flex-grow"></div>
                        </div>

                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={handleDemoLogin}
                            className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border-2 border-emerald-500/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 backdrop-blur-sm shadow-lg shadow-emerald-900/30 h-9 text-xs"
                        >
                            Modo Demo (Invitado)
                        </Button>

                        <p className="mt-3 text-center text-[10px] text-slate-400">
                            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                            <button
                                onClick={toggleMode}
                                className="text-amber-400 font-bold hover:text-amber-300 hover:underline transition-colors"
                            >
                                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

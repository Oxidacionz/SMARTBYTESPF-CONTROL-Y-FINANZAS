
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Lock, Mail, Chrome, Eye, EyeOff, Sun, Moon, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

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

  const handleGoogleLogin = async () => {
    const origin = window.location.origin;
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: origin }
        });
        if (error) throw error;
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError("Error iniciando sesión con Google. Verifica la configuración en Supabase.");
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 relative flex flex-col max-h-[90vh]">
        
        {toggleDarkMode && (
          <button 
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Cambiar tema"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative shrink-0">
            <h1 className="text-2xl font-bold text-white mb-2">SMART BYTES.PF</h1>
            <p className="text-blue-100 text-sm">Finanzas personales inteligentes</p>
        </div>

        <div className="p-8 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>

            {/* Mensaje de Éxito pero Bloqueo por Configuración */}
            {successMsg && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4 text-center">
                    <div className="flex justify-center mb-2 text-green-600 dark:text-green-400">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="font-bold text-green-800 dark:text-green-200 mb-1">¡Registrado!</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                        Si no has entrado automáticamente, revisa el error abajo.
                    </p>
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                    <Input 
                        placeholder="Nombre Completo" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pl-2"
                    />
                )}
                
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                    <Input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                    <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 z-10 focus:outline-none"
                    >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {isLogin && (
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300">
                    <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Recordar contraseña
                    </label>
                </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-xs flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <Button fullWidth className="bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-lg">
                    {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                    {!loading && <ArrowRight size={20} />}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-2">
                <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-grow"></div>
                <span className="text-xs text-gray-400">O continúa con</span>
                <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-grow"></div>
            </div>

            <Button 
                fullWidth 
                variant="secondary" 
                onClick={handleGoogleLogin}
                icon={<Chrome size={18} />}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            >
                Google
            </Button>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button 
                    onClick={toggleMode}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                    {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

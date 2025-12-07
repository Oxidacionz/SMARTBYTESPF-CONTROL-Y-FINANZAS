
import React, { useState, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { UserProfile } from '../../../types';
import { User, Save, X, Camera, Lock, Check, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { dbEvents } from '../../../services/db';

interface ProfileModalProps {
    user: UserProfile;
    onUpdate: (profile: UserProfile) => void;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdate, onClose }) => {
    const [fullName, setFullName] = useState(user.full_name || '');
    const [birthDate, setBirthDate] = useState(user.birth_date || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
    const [loading, setLoading] = useState(false);

    // Security State
    const [showSecurity, setShowSecurity] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityMsg, setSecurityMsg] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const calculateAge = (dateString: string) => {
        if (!dateString) return '';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada. Máximo 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            setSecurityMsg('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setSecurityMsg('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setLoading(false);

        if (error) {
            setSecurityMsg(`Error: ${error.message}`);
        } else {
            setSecurityMsg('Contraseña actualizada correctamente.');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setShowSecurity(false), 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = {
                id: user.id,
                full_name: fullName,
                birth_date: birthDate,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            // Birthday Logic
            if (birthDate) {
                const [year, month, day] = birthDate.split('-');
                const formattedDate = `${month}-${day}`;

                const existingEvents = await dbEvents.getAll();
                const birthdayEvent = existingEvents.find(e => e.type === 'birthday' && e.name.toLowerCase().includes('cumpleaños') && e.user_id === user.id);

                if (birthdayEvent) {
                    if (birthdayEvent.date !== formattedDate) {
                        await dbEvents.update({ ...birthdayEvent, date: formattedDate });
                    }
                } else {
                    await dbEvents.add({
                        id: crypto.randomUUID(),
                        name: 'Mi Cumpleaños',
                        date: formattedDate,
                        type: 'birthday',
                        user_id: user.id
                    });
                }
            }

            onUpdate({ ...user, full_name: fullName, birth_date: birthDate, avatar_url: avatarUrl });
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error actualizando perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            // Clear local persistence to prevent auto-relogin
            sessionStorage.removeItem('demoSession');
            localStorage.removeItem('skipAuth');

            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // The App component listener will handle the redirection to AuthModal
            // We close the modal to avoid UI glitches
            onClose();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] border-2 border-slate-600/50">

                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 flex justify-between items-center text-white shrink-0 rounded-t-xl border-b-2 border-amber-500/30">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <User size={20} className="text-amber-400" />
                        <span className="bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">Mi Perfil</span>
                    </h3>
                    <button onClick={onClose} className="hover:text-amber-300 transition-colors"><X size={24} /></button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-slate-800 to-slate-900">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div
                                    className="w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center text-slate-900 text-3xl font-bold overflow-hidden border-4 border-amber-400/50 cursor-pointer shadow-lg shadow-amber-900/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        fullName ? fullName.charAt(0).toUpperCase() : <User size={40} />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{user.email}</p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Nombre Completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            <div className="flex gap-4">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-sm"
                                        style={{ colorScheme: 'auto' }}
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                    />
                                </div>
                                <div className="w-20">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad</label>
                                    <div className="w-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 text-center text-gray-600 dark:text-gray-300 text-sm h-[38px] flex items-center justify-center">
                                        {calculateAge(birthDate) || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button fullWidth icon={loading ? undefined : <Save size={18} />} className="mt-2" disabled={loading}>
                            {loading ? 'Procesando...' : 'Guardar Cambios'}
                        </Button>
                    </form>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div>
                        <button
                            type="button"
                            onClick={() => setShowSecurity(!showSecurity)}
                            className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-300 font-semibold p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                        >
                            <span className="flex items-center gap-2"><Lock size={18} /> Seguridad</span>
                            <span className="text-xs text-indigo-500">{showSecurity ? 'Ocultar' : 'Cambiar contraseña'}</span>
                        </button>

                        {showSecurity && (
                            <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 animate-fadeIn space-y-3">
                                <Input
                                    type="password"
                                    label="Nueva Contraseña"
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Input
                                    type="password"
                                    label="Confirmar Contraseña"
                                    placeholder="Repite la contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                {securityMsg && (
                                    <div className={`text-xs p-2 rounded flex items-center gap-2 ${securityMsg.includes('correctamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {securityMsg.includes('correctamente') ? <Check size={12} /> : <AlertCircle size={12} />}
                                        {securityMsg}
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    fullWidth
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleUpdatePassword}
                                    className="mt-2"
                                    disabled={loading}
                                >
                                    Actualizar Contraseña
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            fullWidth
                            variant="danger"
                            onClick={handleLogout}
                            className="opacity-80 hover:opacity-100 bg-red-600 hover:bg-red-700"
                            icon={<LogOut size={18} />}
                            disabled={loading}
                        >
                            {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

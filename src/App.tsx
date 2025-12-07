import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { UserProfile } from './types';
import { FinancialProvider } from './context/FinancialContext';
import { MainView } from './components/MainView';
import { AuthModal } from './components/organisms/modals/AuthModal';
import { RefreshCw } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchUserProfile(session.user.id);
      } else {
        const demoSession = sessionStorage.getItem('demoSession');
        if (demoSession) {
          setSession(JSON.parse(demoSession));
          setUserProfile({ id: 'demo-user', email: 'demo@smartbytes.com', full_name: 'Usuario Demo' });
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (userId === 'demo-user') {
      setUserProfile({ id: 'demo-user', email: 'demo@smartbytes.com', full_name: 'Usuario Demo' });
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUserProfile(data);
  };

  const hasSkippedAuth = localStorage.getItem('skipAuth') === 'true';

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-500" /></div>;

  if (!session && !hasSkippedAuth) return <AuthModal darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />;

  return (
    <FinancialProvider session={session} userProfile={userProfile}>
      <MainView
        session={session}
        userProfile={userProfile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={() => { supabase.auth.signOut(); sessionStorage.removeItem('demoSession'); setSession(null); }}
      />
    </FinancialProvider>
  );
}

export default App;

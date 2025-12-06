import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR CRÍTICO: Variables de entorno de Supabase no configuradas');
    console.error('VITE_SUPABASE_URL:', supabaseUrl);
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Configurada' : 'No configurada');
    console.error('Asegúrate de que el archivo .env.local existe y contiene las variables correctas');
    throw new Error('Supabase no está configurado correctamente. Revisa la consola para más detalles.');
}

console.log('✅ Supabase configurado correctamente');
console.log('URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);
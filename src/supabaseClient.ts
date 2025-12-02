import { createClient } from '@supabase/supabase-js';

// Configuration from your provided details
const supabaseUrl = 'https://zfesgvclmgzsaldjoyjq.supabase.co';
const supabaseKey = 'sb_publishable_VH2E4NxtPX1cIZjOoLzjmQ_IFPgedwf'; // Using the publishable key as requested

export const supabase = createClient(supabaseUrl, supabaseKey);
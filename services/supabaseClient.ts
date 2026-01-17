
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tstboympleybwbdwicik.supabase.co';
const supabaseKey = 'sb_publishable_vq6bfHaokjK8BXfaubINXA_8xGwEwhH';

export const supabase = createClient(supabaseUrl, supabaseKey);

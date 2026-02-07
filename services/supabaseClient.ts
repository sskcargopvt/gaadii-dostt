
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tstboympleybwbdwicik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdGJveW1wbGV5YndiZHdpY2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDg0OTcsImV4cCI6MjA4NDIyNDQ5N30.JQZFd3z4yrVeUHG66Pe_FGFnupoG6JfguEP8auY-qUE';

export const supabase = createClient(supabaseUrl, supabaseKey);

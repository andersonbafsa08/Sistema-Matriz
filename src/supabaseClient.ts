
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types';

// Estes são os valores padrão para o desenvolvimento local do Supabase.
// Eles são gerados pelo comando `supabase start`.
// Usar 127.0.0.1 em vez de 'localhost' pode resolver problemas de conexão em alguns ambientes.
const supabaseUrl = 'https://appqhkgjcrpfhrdyoknp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcHFoa2dqY3JwZmhyZHlva25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDU4MDQsImV4cCI6MjA2ODEyMTgwNH0.crh3_aQcv2TkTpDIsD1jzuikOK-uuyU-SvohD_tZQMQ';

// Este alerta serve como um backup caso os valores estejam incorretos.
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('SUA_URL')) {
  alert(
    'ERRO DE CONFIGURAÇÃO: As credenciais do Supabase não estão configuradas corretamente no arquivo `src/supabaseClient.ts`.\n\n' +
    'Se estiver rodando localmente, certifique-se que o Supabase está rodando (`supabase start`).\n\n' +
    'Verifique o terminal onde executou `supabase start` para confirmar a URL da API e a chave anônima (anon key).'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
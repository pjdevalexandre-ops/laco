import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('sua-url-do-projeto')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Métodos de Autenticação do Organizador
export const authService = {
  isConfigured: isSupabaseConfigured,

  getCurrentUser: async () => {
    if (!supabase) {
      // Modo Local / Demo
      const localUser = localStorage.getItem('laco_auth_user');
      return localUser ? JSON.parse(localUser) : null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  signIn: async (email, password) => {
    if (!supabase) {
      // Mock de autenticação local para teste se Supabase não tiver chaves no .env
      if (email && password && password.length >= 6) {
        const mockUser = {
          id: 'org-local-admin',
          email,
          user_metadata: { name: email.split('@')[0] }
        };
        localStorage.setItem('laco_auth_user', JSON.stringify(mockUser));
        window.dispatchEvent(new Event('laco_auth_updated'));
        return { data: { user: mockUser }, error: null };
      }
      return { data: null, error: { message: 'Senha deve ter no mínimo 6 caracteres.' } };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signUp: async (email, password) => {
    if (!supabase) {
      if (email && password && password.length >= 6) {
        const mockUser = {
          id: 'org-local-admin',
          email,
          user_metadata: { name: email.split('@')[0] }
        };
        localStorage.setItem('laco_auth_user', JSON.stringify(mockUser));
        window.dispatchEvent(new Event('laco_auth_updated'));
        return { data: { user: mockUser }, error: null };
      }
      return { data: null, error: { message: 'Senha deve ter no mínimo 6 caracteres.' } };
    }
    return await supabase.auth.signUp({ email, password });
  },

  signOut: async () => {
    localStorage.removeItem('laco_auth_user');
    window.dispatchEvent(new Event('laco_auth_updated'));
    if (supabase) {
      await supabase.auth.signOut();
    }
    return { error: null };
  }
};

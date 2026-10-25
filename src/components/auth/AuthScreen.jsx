import React, { useState } from 'react';
import { Lock, Mail, Key, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { authService, isSupabaseConfigured } from '../../services/supabase';

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isCloud = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = isRegister
        ? await authService.signUp(email, password)
        : await authService.signIn(email, password);

      if (res.error) {
        setErrorMsg(res.error.message || 'Falha ao autenticar.');
      } else {
        onLoginSuccess(res.data?.user);
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo LAÇO */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#722F37] text-[#FAF7F2] flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-md">
            L
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#722F37] tracking-wider">LAÇO</h1>
          <p className="text-xs text-[#7A7265] max-w-xs mx-auto">
            Acesso exclusivo para profissionais do ateliê de convites e assessoria
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
            <h2 className="font-serif text-xl text-[#231F1C]">
              {isRegister ? 'Criar Conta do Ateliê' : 'Entrar no Painel'}
            </h2>
            <span className="text-[11px] font-semibold text-[#8E8679] uppercase tracking-wider">
              {isCloud ? 'Supabase Nuvem' : 'Ambiente Seguro'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                E-mail profissional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu@atelie.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                Senha de acesso
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#8E8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#722F37] hover:bg-[#581C23] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Acessando...' : isRegister ? 'Cadastrar e Entrar' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Alternar entre Login e Cadastro */}
          <div className="pt-2 text-center border-t border-[#F2ECE1]">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs font-semibold text-[#722F37] hover:underline"
            >
              {isRegister
                ? 'Já possui uma conta? Faça login aqui'
                : 'Novo organizador? Cadastre seu ateliê'}
            </button>
          </div>
        </div>

        {/* Rodapé explicativo */}
        <div className="text-center text-[11px] text-[#8E8679]">
          <p>Seus convidados acessam diretamente pelo link público exclusivo sem precisar de senha.</p>
        </div>

      </div>
    </div>
  );
}

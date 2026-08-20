import React, { useState } from 'react';
import {
  Link2,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetUserPassword } from '../services/authService';

interface AuthViewProps {
  onAuthSuccess: () => void;
  onOpenConfig?: () => void;
  onOpenCodeExport?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      let message = 'Ocorreu um erro ao processar a autenticação.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está cadastrado. Tente fazer login.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Falha ao autenticar com o Google.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage('Digite seu e-mail para receber as instruções de recuperação.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await resetUserPassword(email);
      setSuccessMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center px-4 py-12 bg-[#0A1128] text-[#F8FAFC]">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E3014] text-[#A3E635] border border-[#365314] shadow-lg shadow-black/50">
            <Link2 className="h-7 w-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isRegistering ? 'Crie sua conta no MeloVision' : 'MeloVision Shortener'}
          </h1>
          <p className="mt-2 text-xs text-[#94A3B8]">
            Encurtador com padrão militar exclusivo{' '}
            <code className="font-mono font-bold text-[#A3E635] bg-[#162710] border border-[#2D4A1C] px-2 py-0.5 rounded">
              melovisionXXXX
            </code>
          </p>
        </div>

        {/* Navy Card */}
        <div className="bg-[#101A36] rounded-2xl shadow-2xl border border-[#1C2B54] p-8">
          
          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-800/60 bg-red-950/40 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#365314] bg-[#162710] p-3.5 text-xs text-[#A3E635]">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            id="btn-google-login"
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1C2B54] bg-[#0D1630] px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 shadow-sm transition hover:bg-[#152349] hover:border-[#284177] disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Entrar com o Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1C2B54]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="bg-[#101A36] px-3 text-[#64748B]">
                Ou credenciais de e-mail
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold uppercase text-[#94A3B8] mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="input-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Gabriel Melo"
                    className="w-full rounded-xl border border-[#1C2B54] bg-[#090F24] py-2.5 pl-10 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-[#94A3B8] mb-1.5">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gabriel@melovision.com"
                  className="w-full rounded-xl border border-[#1C2B54] bg-[#090F24] py-2.5 pl-10 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-[#94A3B8]">
                  Senha
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-[11px] font-semibold text-[#A3E635] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#1C2B54] bg-[#090F24] py-2.5 pl-10 pr-10 text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button in Military Green */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4D7C0F] hover:bg-[#3F6212] active:bg-[#365314] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#4D7C0F]/20 transition disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{isRegistering ? 'Criar Conta' : 'Acessar Dashboard'}</span>
                  <ArrowRight className="h-4 w-4 text-[#A3E635]" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-xs text-[#94A3B8]">
            {isRegistering ? (
              <span>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#A3E635] hover:underline ml-1"
                >
                  Fazer Login
                </button>
              </span>
            ) : (
              <span>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#A3E635] hover:underline ml-1"
                >
                  Criar conta grátis
                </button>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

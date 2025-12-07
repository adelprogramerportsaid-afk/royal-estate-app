
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!supabase) {
      setErrorMsg("خدمة Supabase غير متصلة. تأكد من إعداد المفاتيح في ملف .env");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
        setIsLogin(true);
      }
      onClose();
    } catch (error: any) {
      setErrorMsg(error.message === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-royal-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-float" style={{animationDuration: '0.4s', animationName: 'fade-in-up'}}>
        
        {/* Header */}
        <div className="bg-royal-900 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-jewel-pattern opacity-10"></div>
          <h2 className="text-3xl font-black mb-2 relative z-10">{isLogin ? 'مرحباً بعودتك' : 'انضم إلينا'}</h2>
          <p className="text-royal-gold relative z-10 text-sm">بوابة المستقبل للاستثمار العقاري</p>
          <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={18} /></button>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 focus:ring-1 focus:ring-royal-900 outline-none transition bg-slate-50 focus:bg-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 mr-1">كلمة المرور</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 focus:ring-1 focus:ring-royal-900 outline-none transition bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-royal-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <>تسجيل الدخول <LogIn size={18}/></> : <>إنشاء حساب <UserPlus size={18}/></>)}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm mb-2">
              {isLogin ? 'ليس لديك حساب بعد؟' : 'لديك حساب بالفعل؟'}
            </p>
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
              className="text-royal-900 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

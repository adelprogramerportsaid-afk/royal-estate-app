import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Shield, Bell, LogOut, Menu } from 'lucide-react';

interface IdentityCardProps {
  user: User | null;
  onLogout: () => void;
  toggleSidebar: () => void;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ user, onLogout, toggleSidebar }) => {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-40 transition-all duration-500 ease-in-out ${
        isShrunk ? 'mx-8 translate-y-0' : 'mx-0 translate-y-2'
      }`}
    >
      <div className={`
        bg-white/90 backdrop-blur-md rounded-3xl shadow-float border border-white/50
        flex items-center justify-between px-6 
        ${isShrunk ? 'py-3' : 'py-6'}
        transition-all duration-500
      `}>
        {/* Right Side: User Info */}
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-full md:hidden text-royal-900">
             <Menu size={24} />
          </button>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-royal-gradient p-0.5 shadow-lg">
               <div className="w-full h-full bg-white rounded-[14px] overflow-hidden">
                 <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=002147&color=fff`} alt="User" className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-royal-gold w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className={`${isShrunk ? 'opacity-0 w-0 overflow-hidden hidden md:block' : 'opacity-100 w-auto'} transition-all duration-300`}>
            <h2 className="text-royal-900 font-bold text-lg leading-tight">{user.name}</h2>
            <p className="text-slate-500 text-xs font-medium">{user.role === UserRole.BROKER ? 'مدير مكتب عقاري' : 'مستخدم'}</p>
          </div>
        </div>

        {/* Center: Brand (Only visible when not shrunk or large screens) */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
           <div className={`flex items-center gap-2 ${isShrunk ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
             <Shield className="text-royal-900 fill-royal-900" size={24} />
             <span className="font-bold text-royal-900 tracking-wider hidden md:block">المنصة العقارية</span>
           </div>
        </div>

        {/* Left Side: Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-royal-900 relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-medium text-sm"
          >
            <span className={`${isShrunk ? 'hidden' : 'block'}`}>خروج</span>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
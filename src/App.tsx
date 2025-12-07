import React, { useState, useEffect } from 'react';
import { User, UserRole, Property } from './types';
import { MOCK_PROPERTIES } from './constants';
import { IdentityCard } from './components/IdentityCard';
import { ContractEditor, WatermarkTool } from './components/Tools';
import { TrapDoor } from './components/TrapDoor';
import { AddPropertyModal } from './components/AddPropertyModal';
import { AuthModal } from './components/AuthModal';
import { supabase } from './supabaseClient';
import { 
  Home, Briefcase, Key, Lock, Search, 
  LayoutDashboard, Camera, Users, 
  TrendingUp, Calculator, MapPin, DollarSign,
  ChevronRight, Plus, Loader2, Edit, Trash2
} from 'lucide-react';

/* --- DASHBOARD COMPONENTS --- */

interface PropertyCardProps {
  property: Property;
  currentUser: User | null;
  onDelete: (id: string) => void;
  onEdit: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, currentUser, onDelete, onEdit }) => {
  const isOwner = currentUser?.id === property.ownerId || currentUser?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="group bg-white rounded-[2rem] shadow-float overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative border border-slate-100">
      <div className="relative h-64 overflow-hidden">
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-royal-900 shadow-sm flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${property.status === 'sale' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          {property.status === 'sale' ? 'للبيع' : 'للإيجار'}
        </div>

        {/* Action Buttons (For Owners/Admins) */}
        {isOwner && (
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button 
              onClick={() => onEdit(property)}
              className="p-2 bg-white/90 backdrop-blur rounded-full text-royal-900 hover:bg-royal-900 hover:text-white transition shadow-sm"
              title="تعديل"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(property.id)}
              className="p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
              title="حذف"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        <img src={property.image || 'https://via.placeholder.com/800x600?text=No+Image'} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-royal-900/80 via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-4 right-4 text-white">
           <p className="text-2xl font-bold font-sans">{property.price.toLocaleString()} ج.م</p>
           <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14} /> {property.location}</p>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-royal-900 mb-2 leading-snug">{property.title}</h3>
        <div className="flex justify-between items-center text-slate-500 text-sm border-t border-slate-100 pt-4 mt-2">
           <span className="flex items-center gap-1"><Home size={16} className="text-royal-400" /> {property.area}م²</span>
           <span className="flex items-center gap-1"><Key size={16} className="text-royal-400" /> {property.bedrooms} غرف</span>
           <span className="flex items-center gap-1"><Briefcase size={16} className="text-royal-400" /> {property.finishing}</span>
        </div>
        <button className="w-full mt-6 py-3 rounded-xl bg-royal-50 text-royal-900 font-bold hover:bg-royal-900 hover:text-white transition-colors duration-300">
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: any, color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-float border border-slate-50 flex items-center gap-4 hover:scale-105 transition-transform cursor-default">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={28} />
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-royal-900">{value}</h4>
    </div>
  </div>
);

/* --- MAIN APP --- */

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Modal States
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  
  // Real Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(false);

  // Authentication Setup
  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile data
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({data: profile}) => {
             setUser({
                id: session.user.id,
                name: profile?.full_name || session.user.email?.split('@')[0] || 'مستخدم',
                role: (profile?.role as UserRole) || UserRole.BROKER,
                avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${session.user.email}&background=002147&color=fff`
              });
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({data: profile}) => {
             setUser({
                id: session.user.id,
                name: profile?.full_name || session.user.email?.split('@')[0] || 'مستخدم',
                role: (profile?.role as UserRole) || UserRole.BROKER,
                avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${session.user.email}&background=002147&color=fff`
              });
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  // Mock Login Handlers (Legacy)
  const loginAsGuest = () => setUser({ id: 'guest', name: 'زائر كريم', role: UserRole.GUEST });
  
  // Fetch Properties
  const fetchProperties = async () => {
    setIsLoadingProps(true);
    if (!supabase) {
      setProperties(MOCK_PROPERTIES);
      setIsLoadingProps(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const mappedProps: Property[] = data.map((p: any) => ({
          id: p.id.toString(),
          title: p.title,
          price: Number(p.price),
          area: Number(p.area),
          location: p.location,
          type: p.type,
          status: p.status,
          image: p.image_url, // Map from DB 'image_url' to App 'image'
          images: p.images,
          bedrooms: Number(p.bedrooms),
          bathrooms: Number(p.bathrooms),
          finishing: p.finishing,
          description: p.description,
          ownerId: p.owner_id, // Map from DB 'owner_id' to App 'ownerId'
          created_at: p.created_at
        }));
        setProperties(mappedProps);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      // Fallback to mocks only if completely failed or empty in dev
      // setProperties(MOCK_PROPERTIES); 
      setProperties([]);
    } finally {
      setIsLoadingProps(false);
    }
  };

  useEffect(() => {
    // Fetch properties even for guests
    fetchProperties();
  }, []); // Run once on mount

  // --- CRUD ACTIONS ---

  const handlePropertySaved = () => {
    setIsAddPropertyOpen(false);
    setPropertyToEdit(null); // Reset edit state
    fetchProperties();
    setActiveTab('market');
  };

  const handleCloseModal = () => {
    setIsAddPropertyOpen(false);
    setPropertyToEdit(null);
  };

  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setIsAddPropertyOpen(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العقار نهائياً؟")) return;

    if (!supabase) {
      alert("لا يمكن الحذف في الوضع التجريبي.");
      return;
    }

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      
      // Refresh list
      fetchProperties();
      // Optional: Show toast
    } catch (err: any) {
      console.error("Error deleting property:", err);
      alert("حدث خطأ أثناء الحذف: " + err.message);
    }
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard, roles: [UserRole.BROKER, UserRole.SUPER_ADMIN] },
    { id: 'market', label: 'سوق العقارات', icon: Home, roles: [UserRole.GUEST, UserRole.CLIENT, UserRole.BROKER, UserRole.SUPER_ADMIN] },
    { id: 'tools', label: 'الأدوات الاحترافية', icon: Briefcase, roles: [UserRole.BROKER, UserRole.SUPER_ADMIN] },
    { id: 'team', label: 'فريق العمل', icon: Users, roles: [UserRole.BROKER] },
    { id: 'finance', label: 'الخزينة', icon: DollarSign, roles: [UserRole.SUPER_ADMIN] },
  ];

  /* --- LOGIN SCREEN --- */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-royal-900">
           <div className="absolute inset-0 bg-jewel-pattern opacity-10"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-royal-900 via-royal-800 to-royal-900"></div>
           <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4">
          <div className="text-center mb-16 space-y-4">
             <div className="inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl mb-4">
                <Lock size={48} className="text-white" />
             </div>
             <h1 className="text-6xl font-black text-white tracking-tight mb-2 font-sans">المنصة العقارية</h1>
             <p className="text-xl text-blue-200 font-light tracking-widest">بوابة المستقبل للاستثمار العقاري الفاخر</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Guest Login */}
            <button 
              onClick={loginAsGuest}
              className="group relative bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 rounded-[2rem] p-8 text-right transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-royal-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
               <div className="mb-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
                 <Search size={28} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">دخول الزوار</h3>
               <p className="text-blue-200 text-sm mb-6">تصفح العقارات المتاحة دون تسجيل</p>
               <div className="flex items-center text-royal-400 font-bold text-sm gap-2 group-hover:gap-4 transition-all">
                 دخول الآن <ChevronRight size={16} />
               </div>
            </button>

            {/* Real Login (Brokers & Clients) */}
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="group relative bg-gradient-to-b from-royal-800 to-royal-900 border border-royal-700 rounded-[2rem] p-8 text-right transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-royal-900/50 overflow-hidden md:scale-110 z-10"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-royal-gold to-transparent"></div>
               <div className="mb-6 w-14 h-14 rounded-2xl bg-royal-gold text-royal-900 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-lg shadow-royal-gold/20">
                 <Briefcase size={28} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">حسابي</h3>
               <p className="text-blue-200 text-sm mb-6">تسجيل الدخول أو إنشاء حساب جديد لإدارة عقاراتك</p>
               <div className="flex items-center text-royal-gold font-bold text-sm gap-2 group-hover:gap-4 transition-all">
                 تسجيل الدخول <ChevronRight size={16} />
               </div>
            </button>

             {/* VIP Section */}
            <button 
              onClick={() => alert('هذه الميزة متاحة للمستثمرين المعتمدين فقط.')}
              className="group relative bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 rounded-[2rem] p-8 text-right transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-royal-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
               <div className="mb-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
                 <Users size={28} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">كبار المستثمرين</h3>
               <p className="text-blue-200 text-sm mb-6">خدمات خاصة وفرص حصرية للمحافظ الكبرى</p>
               <div className="flex items-center text-royal-400 font-bold text-sm gap-2 group-hover:gap-4 transition-all">
                 طلب انضمام <ChevronRight size={16} />
               </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --- AUTHENTICATED LAYOUT --- */
  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-800 font-sans selection:bg-royal-900 selection:text-white pb-20">
      
      {isAddPropertyOpen && (
        <AddPropertyModal 
          onClose={handleCloseModal} 
          onSuccess={handlePropertySaved}
          propertyToEdit={propertyToEdit}
        />
      )}

      <IdentityCard 
        user={user} 
        onLogout={handleLogout} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex pt-28 px-4 md:px-8 gap-8 max-w-[1920px] mx-auto">
        
        {/* Sidebar Navigation */}
        <aside className={`fixed md:sticky top-32 right-0 h-[calc(100vh-140px)] w-72 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-float border border-white p-6 transition-all z-30 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} md:block hidden`}>
           <div className="space-y-2">
             <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">القائمة الرئيسية</p>
             {navItems.filter(item => item.roles.includes(user.role)).map((item) => {
               const isActive = activeTab === item.id;
               return (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                     isActive 
                     ? 'bg-royal-900 text-white shadow-lg shadow-royal-900/30' 
                     : 'text-slate-500 hover:bg-slate-100 hover:text-royal-900'
                   }`}
                 >
                   <item.icon size={20} className={isActive ? 'text-royal-gold' : ''} />
                   {item.label}
                 </button>
               )
             })}
           </div>

           {/* Quick Actions Card inside Sidebar */}
           <div className="mt-12 bg-gradient-to-br from-royal-900 to-royal-700 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-jewel-pattern opacity-10"></div>
              <h4 className="font-bold text-lg mb-1 relative z-10">رادار الفرص</h4>
              <p className="text-xs text-blue-200 mb-4 relative z-10">تم رصد 3 فرص جديدة في محيطك.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-sm font-bold transition-colors relative z-10">
                استكشاف
              </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-screen">
          
          {/* CONTENT: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-float" style={{animationDuration: '0.5s', animationName: 'fade-in'}}>
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black text-royal-900 mb-2">مرحباً، {user.name} 👋</h1>
                  <p className="text-slate-500">إليك ملخص أداء مكتبك العقاري هذا الشهر.</p>
                </div>
                <button 
                  onClick={() => setIsAddPropertyOpen(true)}
                  className="hidden md:flex items-center gap-2 bg-royal-900 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition"
                >
                  <Plus size={20} /> إضافة عقار
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="إجمالي المبيعات" value="4.2M ج.م" icon={TrendingUp} color="bg-green-500" />
                 <StatCard title="العقارات النشطة" value={`${properties.length} عقار`} icon={Home} color="bg-blue-500" />
                 <StatCard title="العملاء الجدد" value="12 عميل" icon={Users} color="bg-purple-500" />
                 <StatCard title="العمولات المتوقعة" value="180K ج.م" icon={Calculator} color="bg-orange-500" />
              </div>

              {/* Chart Placeholder (Visual Only) */}
              <div className="bg-white rounded-[2rem] p-8 shadow-float border border-slate-50 h-80 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">الرسوم البيانية التفاعلية (قيد التطوير)</p>
                  </div>
                  {/* Decorative chart lines */}
                  <svg className="absolute bottom-0 left-0 w-full h-32 text-royal-50 opacity-50" preserveAspectRatio="none" viewBox="0 0 1440 320"><path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
              </div>
            </div>
          )}

          {/* CONTENT: MARKET */}
          {activeTab === 'market' && (
             <div className="space-y-6">
                <div className="bg-royal-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center bg-jewel-pattern shadow-2xl">
                   <div className="mb-4 md:mb-0">
                     <h2 className="text-2xl font-bold mb-2">السوق العقاري</h2>
                     <p className="text-blue-200 opacity-80">تصفح أحدث الفرص الاستثمارية في السوق المصري</p>
                   </div>
                   <div className="flex bg-white/10 backdrop-blur rounded-xl p-1 w-full md:w-auto">
                     <button className="px-6 py-2 rounded-lg bg-white text-royal-900 font-bold shadow-sm" onClick={() => fetchProperties()}>تحديث</button>
                     <button className="px-6 py-2 rounded-lg text-white hover:bg-white/10 font-medium transition">سكني</button>
                     <button className="px-6 py-2 rounded-lg text-white hover:bg-white/10 font-medium transition">تجاري</button>
                   </div>
                </div>

                {isLoadingProps ? (
                   <div className="flex justify-center items-center py-20">
                     <Loader2 size={48} className="animate-spin text-royal-900" />
                   </div>
                ) : properties.length === 0 ? (
                   <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                     <Home size={48} className="mx-auto text-slate-300 mb-4" />
                     <p className="text-slate-500 font-bold text-lg">لا توجد عقارات متاحة حالياً</p>
                     <p className="text-slate-400">كن أول من يضيف عقاراً للسوق!</p>
                     <button onClick={() => setIsAddPropertyOpen(true)} className="mt-4 text-royal-500 font-bold hover:underline">إضافة عقار الآن</button>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {properties.map(p => (
                      <PropertyCard 
                        key={p.id} 
                        property={p} 
                        currentUser={user}
                        onDelete={handleDeleteProperty}
                        onEdit={handleEditProperty}
                      />
                    ))}
                  </div>
                )}
             </div>
          )}

          {/* CONTENT: TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-12">
               <div>
                 <h2 className="text-3xl font-black text-royal-900 mb-6">الأدوات الاحترافية</h2>
                 <p className="text-slate-500 mb-8 max-w-2xl">مجموعة أدوات مصممة خصيصاً للمكاتب العقارية لزيادة الإنتاجية وحماية الحقوق.</p>
                 
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <ContractEditor />
                    <div className="space-y-8">
                       <WatermarkTool />
                       <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-2">مولد الإعلانات (Shadow Unit)</h3>
                            <p className="opacity-80 text-sm">قريباً.. قم بإنشاء إعلانات سوشيال ميديا بنقرة زر.</p>
                          </div>
                          <Camera size={48} className="opacity-50" />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['team', 'finance'].includes(activeTab) && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                   <Lock size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">هذا القسم مقيد</h3>
                <p className="text-slate-500 max-w-md">أنت بحاجة لترقية صلاحياتك أو انتظار التحديث القادم للوصول إلى إدارة الفريق والخزينة.</p>
             </div>
          )}

        </main>
      </div>
    </div>
  );
}
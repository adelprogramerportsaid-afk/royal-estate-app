import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, DollarSign, FileText, Home, CheckCircle, AlertTriangle, Loader2, LayoutTemplate, PenTool, Bath, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Property } from '../types';

interface AddPropertyModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  propertyToEdit?: Property | null;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, onSuccess, propertyToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    type: 'apartment',
    image: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    finishing: 'سوبر لوكس'
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (propertyToEdit) {
      setFormData({
        title: propertyToEdit.title,
        price: propertyToEdit.price.toString(),
        location: propertyToEdit.location,
        description: propertyToEdit.description || '',
        type: propertyToEdit.type,
        image: propertyToEdit.image,
        area: propertyToEdit.area.toString(),
        bedrooms: propertyToEdit.bedrooms?.toString() || '0',
        bathrooms: propertyToEdit.bathrooms?.toString() || '0',
        finishing: propertyToEdit.finishing || 'سوبر لوكس'
      });
      setImagePreview(propertyToEdit.image);
    }
  }, [propertyToEdit]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // معاينة فورية للصورة
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg(null);

    // رفع الصورة إلى Supabase Storage
    if (supabase) {
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. رفع الملف
        const { error: uploadError } = await supabase.storage
          .from('properties') 
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. الحصول على الرابط العام
        const { data } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);
        
        setFormData(prev => ({ ...prev, image: data.publicUrl }));
      } catch (error: any) {
        console.error('Error uploading image:', error);
        setErrorMsg('فشل رفع الصورة. تأكد من إنشاء Bucket باسم "properties" في Supabase وجعله Public.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    setLoading(true);
    setErrorMsg(null);

    const finalImage = formData.image || 'https://picsum.photos/800/600';

    if (!supabase) {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
           if (onSuccess) onSuccess();
           else onClose();
        }, 1500);
      }, 1500);
      return;
    }

    try {
      // Get current user for owner_id checks
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب عليك تسجيل الدخول");

      const propertyData = {
        title: formData.title,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area) || 0,
        location: formData.location,
        description: formData.description,
        type: formData.type,
        status: 'sale',
        image_url: finalImage,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        finishing: formData.finishing,
        // Only update owner_id on insert, not update (security)
        ...(propertyToEdit ? {} : { owner_id: user.id })
      };

      let error;

      if (propertyToEdit) {
        // UPDATE Existing Property
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyToEdit.id)
          .eq('owner_id', user.id); // Extra security check
        error = updateError;
      } else {
        // INSERT New Property
        const { error: insertError } = await supabase
          .from('properties')
          .insert([propertyData]);
        error = insertError;
      }

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error saving property:', err);
      setErrorMsg(err.message || "حدث خطأ أثناء الاتصال بقاعدة البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-royal-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-float" style={{animationDuration: '0.3s', animationName: 'fade-in-up'}}>
        
        {/* Header */}
        <div className="bg-royal-900 p-6 flex justify-between items-center text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {propertyToEdit ? <PenTool className="text-royal-gold" /> : <Home className="text-royal-gold" />}
            {propertyToEdit ? 'تعديل العقار' : 'إضافة عقار جديد'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[85vh] overflow-y-auto scrollbar-hide">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h4 className="text-2xl font-bold text-royal-900 mb-2">{propertyToEdit ? 'تم تحديث البيانات بنجاح!' : 'تم إضافة العقار بنجاح!'}</h4>
              <p className="text-slate-500">تم تحديث قائمة العقارات.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!supabase && (
                 <div className="bg-orange-50 text-orange-600 p-3 rounded-xl text-sm flex items-center gap-2">
                   <AlertTriangle size={16} />
                   تنبيه: لم يتم ربط المفاتيح بملف .env، سيتم استخدام وضع المحاكاة.
                 </div>
              )}
              
              {errorMsg && (
                 <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                   <AlertTriangle size={16} />
                   {errorMsg}
                 </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الإعلان</label>
                    <div className="relative">
                      <input required type="text" placeholder="مثال: شقة فاخرة على النيل" 
                        value={formData.title}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 focus:ring-1 focus:ring-royal-900 outline-none transition"
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                      <FileText size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">السعر (ج.م)</label>
                        <div className="relative">
                        <input required type="number" placeholder="000,000" 
                            value={formData.price}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 outline-none transition"
                            onChange={e => setFormData({...formData, price: e.target.value})}
                        />
                        <DollarSign size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">المساحة (م²)</label>
                        <div className="relative">
                        <input required type="number" placeholder="150" 
                            value={formData.area}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 outline-none transition"
                            onChange={e => setFormData({...formData, area: e.target.value})}
                        />
                        <LayoutTemplate size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">الموقع</label>
                    <div className="relative">
                      <input required type="text" placeholder="الحي، المدينة..." 
                        value={formData.location}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 outline-none transition"
                        onChange={e => setFormData({...formData, location: e.target.value})}
                      />
                      <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">صور العقار</label>
                     <div className={`relative border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center bg-slate-50 transition overflow-hidden group ${uploading ? 'border-royal-400 bg-royal-50' : 'border-slate-300 hover:bg-slate-100'}`}>
                        {uploading ? (
                          <div className="flex flex-col items-center text-royal-900">
                             <Loader2 className="animate-spin mb-2" size={32} />
                             <p className="text-sm font-bold">جاري رفع الصورة...</p>
                          </div>
                        ) : imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload size={32} className="text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm text-slate-500 font-medium">اضغط لرفع الصور</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          disabled={uploading}
                          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">نوع العقار</label>
                        <select 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none"
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        value={formData.type}
                        >
                        <option value="apartment">شقة سكنية</option>
                        <option value="villa">فيلا / قصر</option>
                        <option value="commercial">مقر إداري / تجاري</option>
                        <option value="land">أرض</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">التشطيب</label>
                        <select 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none"
                        onChange={e => setFormData({...formData, finishing: e.target.value})}
                        value={formData.finishing}
                        >
                        <option value="بدون تشطيب">بدون تشطيب</option>
                        <option value="نصف تشطيب">نصف تشطيب</option>
                        <option value="سوبر لوكس">سوبر لوكس</option>
                        <option value="الترا سوبر لوكس">الترا سوبر لوكس</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">الغرف</label>
                     <div className="relative">
                        <input type="number" placeholder="3" 
                            value={formData.bedrooms}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 outline-none transition"
                            onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                        />
                        <Home size={18} className="absolute left-3 top-3.5 text-slate-400" />
                     </div>
                </div>
                <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">الحمامات</label>
                     <div className="relative">
                        <input type="number" placeholder="2" 
                            value={formData.bathrooms}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-royal-900 outline-none transition"
                            onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                        />
                        <Bath size={18} className="absolute left-3 top-3.5 text-slate-400" />
                     </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">تفاصيل إضافية</label>
                <div className="relative">
                    <textarea 
                    className="w-full pl-4 pr-10 p-4 rounded-xl border border-slate-200 focus:border-royal-900 outline-none h-24 resize-none"
                    placeholder="اكتب وصفاً جذاباً للعقار..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                     <PenTool size={18} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              <button 
                disabled={loading || uploading}
                type="submit" 
                className="w-full py-4 bg-royal-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : uploading ? 'انتظر انتهاء الرفع...' : (propertyToEdit ? 'حفظ التعديلات' : 'حفظ ونشر العقار')}
                {!loading && !uploading && <Save size={20} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
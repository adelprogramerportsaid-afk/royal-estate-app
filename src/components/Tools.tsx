import React, { useState, useRef, useEffect } from 'react';
import { CONTRACT_TEMPLATES } from '../constants';
import { Download, Upload, Type, Image as ImageIcon, Camera, Printer } from 'lucide-react';

/* --- CONTRACT EDITOR --- */
export const ContractEditor: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(CONTRACT_TEMPLATES[0]);
  const [formData, setFormData] = useState({
    SELLER_NAME: '',
    BUYER_NAME: '',
    PRICE: '',
    DATE: new Date().toISOString().split('T')[0],
    UNIT_NO: '',
    ADDRESS: ''
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let content = selectedTemplate.content;
      Object.entries(formData).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      
      printWindow.document.write(`
        <html dir="rtl">
          <head><title>طباعة العقد</title></head>
          <body style="font-family: serif; padding: 40px; line-height: 2;">
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
      <h3 className="text-2xl font-bold text-royal-900 mb-6 flex items-center gap-2">
        <Type className="text-royal-400" /> محرر العقود الذكي
      </h3>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">نوع العقد</label>
            <select 
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-royal-900 outline-none"
              onChange={(e) => setSelectedTemplate(CONTRACT_TEMPLATES.find(t => t.id === e.target.value) || CONTRACT_TEMPLATES[0])}
            >
              {CONTRACT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-3">
             <input type="text" placeholder="اسم البائع" className="w-full p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, SELLER_NAME: e.target.value})} />
             <input type="text" placeholder="اسم المشتري" className="w-full p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, BUYER_NAME: e.target.value})} />
             <input type="number" placeholder="السعر (ج.م)" className="w-full p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, PRICE: e.target.value})} />
             <input type="text" placeholder="عنوان الوحدة" className="w-full p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, ADDRESS: e.target.value})} />
          </div>

          <button onClick={handlePrint} className="w-full py-3 bg-royal-900 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            <Printer size={18} /> طباعة العقد
          </button>
        </div>

        <div className="md:col-span-2 bg-paper border border-slate-200 rounded-xl p-8 min-h-[500px] shadow-inner relative overflow-hidden">
           {/* Preview of Contract */}
           <div className="prose max-w-none text-right font-serif" dangerouslySetInnerHTML={{
             __html: Object.entries(formData).reduce((acc, [key, val]) => {
               return acc.replace(new RegExp(`{{${key}}}`, 'g'), `<span class="text-royal-400 font-bold border-b border-dashed border-royal-400">${val || '.......'}</span>`);
             }, selectedTemplate.content)
           }} />
           
           <div className="absolute bottom-4 left-4 opacity-10">
              <img src="https://via.placeholder.com/150" alt="Stamp" className="w-32 h-32" />
           </div>
        </div>
      </div>
    </div>
  );
};

/* --- WATERMARK TOOL --- */
export const WatermarkTool: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState('المنصة العقارية');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const img = new Image();
      img.src = URL.createObjectURL(e.target.files[0]);
      img.onload = () => {
        setImage(img);
        draw(img, text);
      };
    }
  };

  const draw = (img: HTMLImageElement, txt: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    
    // Add dim layer
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Watermark style
    ctx.font = `bold ${canvas.width / 15}px Tajawal`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(txt, 0, 0);
    ctx.restore();
    
    // Logo in corner
    ctx.fillStyle = '#002147';
    ctx.fillRect(20, canvas.height - 60, 200, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Tajawal';
    ctx.fillText('محفوظ لـ ' + txt, 120, canvas.height - 35);
  };

  useEffect(() => {
    if (image) draw(image, text);
  }, [text, image]);

  const download = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'watermarked-property.png';
        link.href = canvas.toDataURL();
        link.click();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 mt-8">
      <h3 className="text-2xl font-bold text-royal-900 mb-6 flex items-center gap-2">
        <ImageIcon className="text-royal-400" /> إضافة العلامة المائية
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-4">
           <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
             <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
             <Upload className="mx-auto text-slate-400 mb-2" size={32} />
             <p className="text-slate-500 font-medium">اسحب صورة العقار هنا</p>
           </div>
           
           <input 
             type="text" 
             value={text} 
             onChange={(e) => setText(e.target.value)} 
             className="w-full p-3 rounded-xl border border-slate-200" 
             placeholder="نص العلامة المائية"
           />

           <button onClick={download} disabled={!image} className="w-full py-3 bg-royal-900 disabled:bg-slate-300 text-white rounded-xl shadow-lg flex items-center justify-center gap-2">
             <Download size={18} /> تحميل الصورة
           </button>
        </div>

        <div className="w-full md:w-2/3 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
           {image ? (
             <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" />
           ) : (
             <p className="text-slate-400">لا توجد صورة</p>
           )}
        </div>
      </div>
    </div>
  );
};
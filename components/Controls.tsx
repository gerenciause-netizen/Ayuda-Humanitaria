
import React, { useState } from 'react';
import { PosterData, ThemeColor } from '../types';
import { User, Stethoscope, MapPin, CreditCard, Phone, Type, Palette, Camera, DollarSign, FileText, Upload, CheckCircle2, Loader2, Activity, Building2, Smartphone } from 'lucide-react';
import { supabase } from '../supabase';

interface ControlsProps {
  data: PosterData;
  onChange: (newData: Partial<PosterData>) => void;
  theme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

export const Controls: React.FC<ControlsProps> = ({ data, onChange, theme, onThemeChange }) => {
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Por favor sube solo archivos PDF.");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
      const { data: uploadData, error } = await supabase.storage
        .from('reports')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      onChange({ medicalReportUrl: publicUrl });
    } catch (err) {
      console.error(err);
      alert("Error al subir el PDF.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Picker */}
      <section>
        <label className="text-base font-black text-slate-700 flex items-center gap-3 mb-4 uppercase tracking-widest">
          <Palette size={20} /> Color del Poster
        </label>
        <div className="flex gap-4">
          {Object.values(ThemeColor).map((c) => (
            <button
              key={c}
              onClick={() => onThemeChange(c)}
              className={`w-12 h-12 rounded-full border-4 transition transform active:scale-95 ${
                theme === c ? 'border-slate-800 scale-110 shadow-lg' : 'border-transparent'
              } ${
                c === 'pink' ? 'bg-pink-400' : 
                c === 'blue' ? 'bg-sky-400' : 
                c === 'yellow' ? 'bg-amber-400' : 
                'bg-purple-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Photo & PDF Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 mb-3 ml-1 tracking-widest">
            <Camera size={14} /> Foto del Paciente
          </label>
          <div className="relative group h-28">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center group-hover:border-indigo-400 transition bg-slate-50 flex flex-col items-center justify-center gap-2">
              <Upload size={24} className="text-slate-400" />
              <p className="text-xs text-slate-500 font-black">{data.photoUrl ? "Cambiar Foto" : "Subir Foto"}</p>
            </div>
          </div>
        </section>

        <section>
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 mb-3 ml-1 tracking-widest">
            <FileText size={14} /> Informes Médicos (PDF)
          </label>
          <div className="relative group h-28">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePdfUpload}
              disabled={isUploadingPdf}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`h-full border-2 border-dashed rounded-2xl p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
              data.medicalReportUrl ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 group-hover:border-indigo-400'
            }`}>
              {isUploadingPdf ? (
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              ) : data.medicalReportUrl ? (
                <CheckCircle2 size={24} className="text-green-500" />
              ) : (
                <Upload size={24} className="text-slate-400" />
              )}
              <p className="text-xs text-slate-500 font-black">
                {isUploadingPdf ? "Subiendo..." : data.medicalReportUrl ? "PDF Listo" : "Subir PDF"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
            <User size={14} /> Nombre del Paciente
          </label>
          <input
            type="text"
            value={data.patientName}
            onChange={(e) => onChange({ patientName: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition text-base font-bold"
            placeholder="Ej: Nuvia Lezama de Alvarez"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
              <DollarSign size={14} /> Monto Requerido
            </label>
            <input
              type="text"
              value={data.totalAmount}
              onChange={(e) => onChange({ totalAmount: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition text-lg font-black text-green-700"
              placeholder="Ej: $3,500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
              <Activity size={14} /> Diagnóstico
            </label>
            <input
              type="text"
              value={data.condition}
              onChange={(e) => onChange({ condition: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition text-base font-bold"
              placeholder="Ej: Quiste Gigante en el Hígado"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
            <Stethoscope size={14} /> Procedimiento Médico
          </label>
          <input
            type="text"
            value={data.procedure}
            onChange={(e) => onChange({ procedure: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition text-base font-bold"
            placeholder="Ej: Cirugía Laparoscópica"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
            <MapPin size={14} /> Ubicación
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition text-base font-bold"
            placeholder="Ej: Puerto Ordaz, Estado Bolívar"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
            <Type size={14} /> Historia Médica / Descripción
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition text-base min-h-[140px] resize-none leading-relaxed font-bold"
            placeholder="Relata brevemente la situación del paciente..."
          />
        </div>
      </div>

      {/* Payment Info */}
      <section className="pt-8 border-t border-slate-100 space-y-8">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-3 mb-2 uppercase tracking-widest">
          <CreditCard size={20} /> Datos de Pago
        </h3>
        
        {/* Zelle */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Smartphone size={12}/> Zelle</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={data.zelleEmail}
              onChange={(e) => onChange({ zelleEmail: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Correo Zelle"
            />
            <input
              type="text"
              value={data.zelleHolder}
              onChange={(e) => onChange({ zelleHolder: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Nombre del Titular"
            />
          </div>
        </div>

        {/* Pago Movil */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2"><Smartphone size={12}/> Pago Móvil (Venezuela)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={data.pagoMovilBank}
              onChange={(e) => onChange({ pagoMovilBank: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Banco"
            />
            <input
              type="text"
              value={data.pagoMovilId}
              onChange={(e) => onChange({ pagoMovilId: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Cédula"
            />
            <input
              type="text"
              value={data.pagoMovilPhone}
              onChange={(e) => onChange({ pagoMovilPhone: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black"
              placeholder="Teléfono"
            />
          </div>
        </div>

        {/* Banco (General) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Building2 size={12}/> Transferencia Bancaria</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={data.bankName}
              onChange={(e) => onChange({ bankName: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Nombre del Banco"
            />
            <input
              type="text"
              value={data.bankAccountNumber}
              onChange={(e) => onChange({ bankAccountNumber: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Número de Cuenta"
            />
            <input
              type="text"
              value={data.bankAccountType}
              onChange={(e) => onChange({ bankAccountType: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Tipo (Ahorro/Corriente)"
            />
            <input
              type="text"
              value={data.bankAccountHolder}
              onChange={(e) => onChange({ bankAccountHolder: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Titular"
            />
            <input
              type="text"
              value={data.bankAccountId}
              onChange={(e) => onChange({ bankAccountId: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="ID / Cédula / RIF"
            />
          </div>
        </div>

        {/* Yappy */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Smartphone size={12}/> Yappy (Panamá)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={data.yappyPhone}
              onChange={(e) => onChange({ yappyPhone: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black"
              placeholder="Número de Teléfono"
            />
            <input
              type="text"
              value={data.yappyHolder}
              onChange={(e) => onChange({ yappyHolder: e.target.value })}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="Nombre del Titular"
            />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="pt-8 border-t border-slate-100">
        <label className="text-base font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-widest">
          <Phone size={20} /> Teléfonos de Contacto
        </label>
        <div className="space-y-3">
          {data.contactPhones.map((phone, idx) => (
            <input
              key={idx}
              type="text"
              value={phone}
              onChange={(e) => {
                const newPhones = [...data.contactPhones];
                newPhones[idx] = e.target.value;
                onChange({ contactPhones: newPhones });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black"
              placeholder={`Teléfono de contacto ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

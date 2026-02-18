
import React, { forwardRef } from 'react';
import { PosterData, ThemeColor, Donation } from '../types';
import { Heart, Phone, Quote, FileText, User, Stethoscope, MapPin, Building2, CreditCard, Smartphone } from 'lucide-react';

interface PosterPreviewProps {
  data: PosterData;
  theme: ThemeColor;
  donations?: Donation[];
}

export const PosterPreview = forwardRef<HTMLDivElement, PosterPreviewProps>(({ data, theme, donations = [] }, ref) => {
  const getThemeClasses = () => {
    switch (theme) {
      case ThemeColor.BLUE: 
        return { 
          bg: 'bg-sky-50', 
          primary: 'bg-sky-500', 
          accent: 'bg-sky-100', 
          text: 'text-sky-800', 
          border: 'border-sky-300',
          card: 'bg-sky-900',
          cardText: 'text-sky-50',
          cardMuted: 'text-sky-300/70',
          progressBg: 'bg-sky-950/40'
        };
      case ThemeColor.YELLOW: 
        return { 
          bg: 'bg-amber-50', 
          primary: 'bg-amber-500', 
          accent: 'bg-amber-100', 
          text: 'text-amber-800', 
          border: 'border-amber-300',
          card: 'bg-amber-900',
          cardText: 'text-amber-50',
          cardMuted: 'text-amber-300/70',
          progressBg: 'bg-amber-950/40'
        };
      case ThemeColor.PURPLE: 
        return { 
          bg: 'bg-purple-50', 
          primary: 'bg-purple-500', 
          accent: 'bg-purple-100', 
          text: 'text-purple-800', 
          border: 'border-purple-300',
          card: 'bg-purple-900',
          cardText: 'text-purple-50',
          cardMuted: 'text-purple-300/70',
          progressBg: 'bg-purple-950/40'
        };
      default: 
        return { 
          bg: 'bg-pink-50', 
          primary: 'bg-pink-500', 
          accent: 'bg-pink-100', 
          text: 'text-pink-800', 
          border: 'border-pink-300',
          card: 'bg-pink-900',
          cardText: 'text-pink-50',
          cardMuted: 'text-pink-300/70',
          progressBg: 'bg-pink-950/40'
        };
    }
  };

  const colors = getThemeClasses();
  
  const totalRaised = (donations || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalAmountStr = data?.totalAmount || "";
  const goalValue = parseFloat(totalAmountStr.replace(/[^0-9.]/g, ''));
  const goal = isNaN(goalValue) || goalValue <= 0 ? 1 : goalValue;
  const progress = Math.min((totalRaised / goal) * 100, 100);

  const patientName = data?.patientName || "Nombre del Paciente";
  const condition = data?.condition || "Diagnóstico Médico";
  const procedure = data?.procedure || "Tratamiento / Cirugía";
  const description = data?.description || "Tu generosidad es la esperanza que nuestra familia necesita.";

  const getNameFontSize = (name: string) => {
    const len = name.length;
    if (len > 35) return 'clamp(1rem, 2.5vw, 1.2rem)';
    if (len > 25) return 'clamp(1.2rem, 4vw, 1.8rem)';
    return 'clamp(1.8rem, 6vw, 2.6rem)';
  };

  const getDescriptionFontSize = (text: string) => {
    const len = text.length;
    if (len > 1000) return '0.65rem';
    if (len > 700) return '0.75rem';
    if (len > 400) return '0.85rem';
    if (len > 200) return '0.95rem';
    return '1.05rem';
  };

  return (
    <div 
      ref={ref}
      className={`relative w-full max-w-[500px] min-h-[900px] h-fit ${colors.bg} rounded-[40px] shadow-2xl overflow-hidden border-[10px] border-white flex flex-col p-6 md:p-8 transition-all duration-500`}
      id="poster-canvas"
    >
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>
      
      <header className="text-center mb-4 relative z-10 flex flex-col items-center shrink-0">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700/50 leading-none mb-1">Campaña de Solidaridad</h2>
        <h1 
          className="font-black uppercase text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] tracking-tighter leading-tight py-1 w-full text-center break-words px-2" 
          style={{ 
            WebkitTextStroke: '1.2px #1e293b',
            fontSize: getNameFontSize(patientName)
          }}
        >
          {patientName}
        </h1>
        <div className={`inline-flex items-center gap-2 mt-1 px-4 py-1.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest ${colors.text} shadow-sm border border-slate-100`}>
          ❤️ Por la salud y la vida ❤️
        </div>
      </header>

      <div className="grid grid-cols-12 gap-3 relative z-10 mb-4 shrink-0">
        <div className="col-span-5 flex flex-col items-center gap-2">
          <div className="relative">
            <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden z-20`}>
              {data?.photoUrl ? (
                <img src={data.photoUrl} alt="Paciente" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                  <User size={36} />
                </div>
              )}
            </div>
            <div className={`absolute -inset-1 ${colors.primary} rounded-[2.2rem] blur-lg opacity-20`}></div>
          </div>
          
          <div className="w-full bg-white/80 p-2 rounded-xl border border-white text-center shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Información / Contacto:</p>
            <div className="flex flex-col gap-1">
              {(data?.contactPhones || []).filter(p => p).slice(0, 2).map((phone, i) => (
                <span key={i} className="text-[9px] font-black text-slate-800 flex items-center justify-center gap-1 leading-none">
                  <Phone size={8} className="text-green-600 shrink-0" fill="currentColor" /> {phone}
                </span>
              ))}
            </div>
          </div>

          {/* Yappy Section - Compact */}
          {data?.yappyPhone && (
            <div className="w-full bg-blue-500 p-2 rounded-xl border border-white shadow-md text-white overflow-hidden">
               <div className="flex items-center gap-1 mb-1">
                 <Smartphone size={10} />
                 <span className="text-[8px] font-black uppercase">YAPPY</span>
               </div>
               <p className="text-[10px] font-black leading-none mb-0.5">{data.yappyPhone}</p>
               <p className="text-[7px] font-bold opacity-80 truncate">{data.yappyHolder}</p>
            </div>
          )}
        </div>

        <div className="col-span-7 flex flex-col gap-2">
          <div className={`${colors.card} ${colors.cardText} p-3 rounded-[1.8rem] shadow-xl flex flex-col gap-3 border-b-4 border-black/20`}>
            {totalAmountStr && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${colors.cardMuted}`}>Meta Solidaria:</span>
                  <span className="text-[10px] font-black">${totalRaised.toLocaleString()}</span>
                </div>
                <div className={`w-full h-2 ${colors.progressBg} rounded-full overflow-hidden`}>
                  <div className={`h-full ${colors.primary} shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-700`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[7px] font-black uppercase opacity-70">
                  <span>Meta: {totalAmountStr}</span>
                  <span className="text-white">{Math.round(progress)}%</span>
                </div>
              </div>
            )}

            <div className="h-px bg-white/10 w-full"></div>

            {/* Zelle Section */}
            {(data?.zelleEmail) && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shrink-0 border border-white/20">
                  <span className="text-[10px] font-black text-white">Z</span>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-[7px] ${colors.cardMuted} font-black uppercase leading-none mb-0.5`}>Zelle</p>
                  <p className="text-[9px] font-black truncate leading-tight">{data.zelleEmail}</p>
                  <p className="text-[7px] font-bold opacity-60 truncate">{data.zelleHolder}</p>
                </div>
              </div>
            )}

            {/* Pago Móvil Section */}
            {(data?.pagoMovilPhone) && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shadow-md shrink-0 border border-white/20">
                  <span className="text-[9px] font-black text-white">PM</span>
                </div>
                <div className="overflow-hidden flex flex-col gap-0.5 w-full">
                  <p className={`text-[7px] ${colors.cardMuted} font-black uppercase leading-none`}>Pago Móvil</p>
                  <p className="text-[10px] font-black truncate leading-tight">{data.pagoMovilPhone}</p>
                  <div className="flex gap-1.5 opacity-60 text-[7px] font-bold overflow-hidden">
                    <span className="truncate">{data.pagoMovilBank}</span>
                    <span className="shrink-0">{data.pagoMovilId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Banco Section */}
            {(data?.bankAccountNumber) && (
              <div className="flex items-start gap-2 border-t border-white/5 pt-2">
                <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center shadow-md shrink-0 border border-white/20">
                  <Building2 size={12} className="text-white" />
                </div>
                <div className="overflow-hidden w-full">
                  <p className={`text-[7px] ${colors.cardMuted} font-black uppercase leading-none mb-0.5`}>Transferencia</p>
                  <p className="text-[9px] font-black leading-tight mb-0.5 truncate">{data.bankAccountNumber}</p>
                  <div className="flex flex-col text-[7px] font-bold opacity-60 leading-tight">
                    <span className="truncate">{data.bankName} - {data.bankAccountType}</span>
                    <span className="truncate">{data.bankAccountHolder} ({data.bankAccountId})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información Médica */}
      <div className="relative z-10 mb-4 shrink-0">
        <div className={`${colors.primary} py-1 px-4 rounded-t-2xl shadow-md flex items-center justify-center gap-2`}>
          <Stethoscope size={12} className="text-white/80" />
          <p className="font-black uppercase tracking-[0.2em] text-white text-[8px]">Detalles Médicos</p>
        </div>
        <div className="bg-white p-3 rounded-b-2xl border border-white shadow-lg grid grid-cols-2 gap-2">
          <div className="text-center border-r border-slate-50 px-1">
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Diagnóstico</p>
            <p className="text-[10px] font-black text-slate-800 leading-tight uppercase">{condition}</p>
          </div>
          <div className="text-center px-1">
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cirugía / Proc.</p>
            <p className={`text-[9px] font-black ${colors.text} leading-tight uppercase`}>{procedure}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col mb-4 min-h-[250px]">
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-xl flex-grow flex flex-col relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-[0.03] text-slate-900 pointer-events-none transform -rotate-12">
            <Quote size={80} />
          </div>
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative z-10">
            <p 
              className="text-slate-800 leading-relaxed font-bold italic tracking-tight whitespace-pre-wrap text-justify"
              style={{ fontSize: getDescriptionFontSize(description) }}
            >
              "{description}"
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
             <div className="flex items-center gap-1.5">
                <MapPin size={10} className={colors.text} />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{data?.location || "Venezuela"}</p>
             </div>
             {data?.medicalReportUrl && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-[7px] font-black text-slate-500 uppercase">
                  <FileText size={8} /> Informe PDF Disponible
                </div>
             )}
          </div>
        </div>
      </div>

      <footer className={`bg-white rounded-full py-3 px-8 text-center shadow-xl relative z-10 mb-2 border-2 ${colors.border} shrink-0`}>
        <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${colors.text} leading-none`}>
           ¡GRACIAS POR TU APOYO!
        </p>
      </footer>
    </div>
  );
});

PosterPreview.displayName = 'PosterPreview';

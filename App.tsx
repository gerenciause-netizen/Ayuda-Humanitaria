
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PosterData, ThemeColor, Donation } from './types';
import { PosterPreview } from './components/PosterPreview';
import { Controls } from './components/Controls';
import { DonationForm } from './components/DonationForm';
import { Sparkles, Heart, Share2, Loader2, HandHeart, Pencil, Eye, Save, Plus, History, ChevronRight, Cloud, FolderHeart, X, Search, Trash2, Calendar, User, MapPin, Activity } from 'lucide-react';
import { supabase } from './supabase';

interface RemotePoster {
  id: string;
  patient_name: string;
  condition: string;
  location: string;
  updated_at: string;
}

const INITIAL_DATA: PosterData = {
  patientName: "",
  condition: "",
  procedure: "",
  location: "",
  description: "",
  zelleEmail: "",
  zelleHolder: "",
  pagoMovilBank: "",
  pagoMovilPhone: "",
  pagoMovilId: "",
  contactPhones: ["", ""],
  photoUrl: null,
  medicalReportUrl: null,
  thankYouMessage: "¡Gracias de todo corazón por tu aporte!",
  totalAmount: ""
};

const App: React.FC = () => {
  const [data, setData] = useState<PosterData>(INITIAL_DATA);
  const [theme, setTheme] = useState<ThemeColor>(ThemeColor.PINK);
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posterId, setPosterId] = useState<string | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [remotePosters, setRemotePosters] = useState<RemotePoster[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      handleLoadId(id);
    } else {
      setIsEditing(false);
    }
  }, []);

  // Cargar historial desde Supabase cuando se abre el modal
  useEffect(() => {
    if (showHistory) {
      fetchRemotePosters();
    }
  }, [showHistory]);

  const fetchRemotePosters = async () => {
    setIsLoadingHistory(true);
    try {
      let query = supabase
        .from('posters')
        .select('id, patient_name, condition, location, updated_at')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (searchTerm) {
        query = query.ilike('patient_name', `%${searchTerm}%`);
      }

      const { data: list, error } = await query;
      if (error) throw error;
      setRemotePosters(list || []);
    } catch (err) {
      console.error("Error al cargar historial de Supabase:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadId = async (id: string) => {
    if (!id || typeof id !== 'string') return;
    const cleanId = id.includes('=') ? id.split('=').pop() || "" : id.trim();
    if (!cleanId) return;

    setShowHistory(false);
    setIsLoading(true);
    
    try {
      const success = await loadPoster(cleanId);
      if (success) {
        setPosterId(cleanId);
        setIsEditing(false);
        loadDonations(cleanId);
        const newUrl = `${window.location.origin}${window.location.pathname}?id=${cleanId}`;
        setPublishedUrl(newUrl);
        window.history.replaceState(null, '', `?id=${cleanId}`);
      } else {
        alert("No se encontró ninguna campaña con ese ID.");
      }
    } catch (err) {
      console.error("Error en flujo de carga:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPoster = async (id: string): Promise<boolean> => {
    try {
      const { data: poster, error } = await supabase.from('posters').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!poster) return false;

      setData({
        patientName: poster.patient_name || "",
        condition: poster.condition || "",
        procedure: poster.procedure || "",
        location: poster.location || "",
        description: poster.description || "",
        zelleEmail: poster.zelle_email || "",
        zelleHolder: poster.zelle_holder || "",
        pagoMovilBank: poster.pago_movil_bank || "",
        pagoMovilPhone: poster.pago_movil_phone || "",
        pagoMovilId: poster.pago_movil_id || "",
        contactPhones: poster.contact_phones || ["", ""],
        photoUrl: poster.photo_url || null,
        medicalReportUrl: poster.medical_report_url || null,
        thankYouMessage: poster.thank_you_message || "¡Gracias!",
        totalAmount: poster.total_amount || ""
      });
      setTheme(poster.theme as ThemeColor || ThemeColor.PINK);
      return true;
    } catch (err) {
      console.error("Error al consultar Supabase:", err);
      return false;
    }
  };

  const loadDonations = async (id: string) => {
    try {
      const { data: list } = await supabase.from('donations').select('*').eq('poster_id', id).order('created_at', { ascending: false });
      setDonations(list || []);
    } catch (err) { console.error(err); }
  };

  const performSave = async () => {
    if (!data.patientName) {
      alert("Por favor, ingresa al menos el nombre del paciente.");
      return null;
    }

    setIsSaving(true);
    const dbPayload = {
      patient_name: data.patientName,
      condition: data.condition,
      procedure: data.procedure,
      location: data.location,
      description: data.description,
      zelle_email: data.zelleEmail,
      zelle_holder: data.zelleHolder,
      pago_movil_bank: data.pagoMovilBank,
      pago_movil_phone: data.pagoMovilPhone,
      pago_movil_id: data.pagoMovilId,
      contact_phones: data.contactPhones,
      photo_url: data.photoUrl,
      // Fix: Use medicalReportUrl instead of medical_report_url from the data object
      medical_report_url: data.medicalReportUrl,
      // Fix: Use thankYouMessage instead of thank_you_message from the data object
      thank_you_message: data.thankYouMessage,
      // Fix: Use totalAmount instead of total_amount from the data object
      total_amount: data.totalAmount,
      theme: theme,
      updated_at: new Date()
    };

    try {
      let result;
      if (posterId) {
        const { data: res, error } = await supabase.from('posters')
          .update(dbPayload)
          .eq('id', posterId)
          .select();
        if (error) throw error;
        result = res;
      } else {
        const { data: res, error } = await supabase.from('posters')
          .insert([dbPayload])
          .select();
        if (error) throw error;
        result = res;
      }

      if (result && result[0]) {
        const newId = result[0].id;
        setPosterId(newId);
        if (!posterId) {
          const newUrl = `${window.location.origin}${window.location.pathname}?id=${newId}`;
          setPublishedUrl(newUrl);
          window.history.replaceState(null, '', `?id=${newId}`);
        }
        return newId;
      }
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
      return null;
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const handleSaveDraft = async () => {
    await performSave();
  };

  const handlePublish = async () => {
    const id = await performSave();
    if (id) {
      setIsEditing(false);
    }
  };

  const createNew = () => {
    if (confirm("¿Estás seguro de crear uno nuevo? Se perderán los cambios no guardados.")) {
      setPosterId(null);
      setData(INITIAL_DATA);
      setPublishedUrl(null);
      setIsEditing(true);
      setShowHistory(false);
      setDonations([]);
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleDataChange = (newData: Partial<PosterData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const refineDescription = async () => {
    if (!data.patientName || !data.condition) {
      alert("Ingresa nombre y diagnóstico para generar la historia.");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Redacta una historia médica corta y muy emotiva para un poster de recaudación. Paciente: ${data.patientName}. Diagnóstico: ${data.condition}. Sé respetuoso y directo. Máximo 300 caracteres.`,
      });
      if (response.text) handleDataChange({ description: response.text.trim().replace(/^"|"$/g, '') });
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <Loader2 className="animate-spin text-pink-500 mb-6" size={64} />
        <Heart size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500 fill-pink-500 animate-pulse" />
      </div>
      <p className="font-black text-3xl text-slate-800 tracking-tight">Cargando Campaña...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b sticky top-0 z-50 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={createNew}>
            <Heart size={36} className="text-pink-500 fill-pink-500 group-hover:scale-110 transition" />
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Solidaridad</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-3 px-6 py-3 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 transition font-black text-lg uppercase tracking-wider shadow-sm border-2 border-amber-200"
            >
              <History size={24} />
              <span className="hidden sm:inline">Historial</span>
            </button>

            {posterId && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition font-black text-lg uppercase tracking-wider shadow-md ${isEditing ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'}`}
              >
                {isEditing ? <Eye size={24} /> : <Pencil size={24} />}
                <span>{isEditing ? "Ver" : "Editar"}</span>
              </button>
            )}

            {isEditing && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition font-black text-lg uppercase"
                >
                  {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                  <span className="hidden sm:inline">Guardar</span>
                </button>

                <button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition font-black text-lg uppercase tracking-wider shadow-xl transform active:scale-95"
                >
                  <Share2 size={24} />
                  <span>Publicar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {!posterId && !isEditing && (
           <div className="max-w-3xl mx-auto text-center py-20">
              <div className="bg-pink-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Heart size={64} className="text-pink-500 fill-pink-500" />
              </div>
              <h2 className="text-6xl font-black mb-8 text-slate-800 leading-none">Crea un Poster Solidario</h2>
              <p className="text-3xl text-slate-600 mb-12 leading-relaxed font-bold">Ayuda a Nuvia Lezama y su familia compartiendo su historia con el mundo.</p>
              
              <div className="flex flex-col gap-6 items-center">
                <button onClick={() => setIsEditing(true)} className="w-full max-w-md py-8 bg-pink-500 text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:bg-pink-600 transition flex items-center justify-center gap-4 transform hover:scale-105 active:scale-95">
                  <Plus size={40} /> Iniciar Nueva Campaña
                </button>
                
                <button onClick={() => setShowHistory(true)} className="w-full max-w-md py-6 bg-white text-amber-700 border-4 border-amber-200 rounded-[3rem] font-black text-2xl shadow-xl hover:bg-amber-50 transition flex items-center justify-center gap-4">
                  <History size={32} /> Ver Historial Completo
                </button>
              </div>
           </div>
        )}

        {(isEditing || posterId) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-10 no-print">
              {(!isEditing && posterId) ? (
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 animate-in fade-in slide-in-from-left-8 duration-500">
                  <h2 className="text-5xl font-black text-slate-800 mb-10 italic">¿Deseas apoyar?</h2>
                  <button onClick={() => setShowDonationForm(true)} className="w-full py-8 bg-pink-500 text-white rounded-[2rem] font-black hover:bg-pink-600 transition shadow-2xl flex items-center justify-center gap-5 text-3xl transform active:scale-95">
                    <HandHeart size={40} /> Registrar Aporte
                  </button>
                  <div className="mt-16 border-t pt-12">
                    <h3 className="text-xl font-black text-slate-400 uppercase mb-10 tracking-[0.2em]">Aportes Recientes</h3>
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                      {donations.length > 0 ? donations.map((d, i) => (
                        <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex justify-between items-center animate-in fade-in slide-in-from-bottom-6">
                          <div className="flex flex-col gap-2">
                            <span className="font-black text-slate-800 text-2xl">{d.donor_name}</span>
                            {d.message && <p className="text-lg text-slate-500 italic font-bold leading-snug">"{d.message}"</p>}
                          </div>
                          <span className="text-2xl font-black text-green-600 bg-green-50 px-6 py-3 rounded-full border-2 border-green-100 shadow-sm">${d.amount}</span>
                        </div>
                      )) : <p className="text-center text-slate-400 text-2xl py-20 italic font-bold">Aún no hay registros de aportes.</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border-2 border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Datos de la Campaña</h2>
                    <button 
                      onClick={refineDescription} 
                      disabled={isGenerating} 
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-black transition border-2 ${isGenerating ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100'}`}
                    >
                      {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />} 
                      <span>IA Redacción</span>
                    </button>
                  </div>
                  <Controls data={data} onChange={handleDataChange} theme={theme} onThemeChange={setTheme} />
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col items-center">
              <PosterPreview data={data} theme={theme} donations={donations} />
              
              {publishedUrl && !isEditing && (
                <div className="mt-12 w-full max-w-[500px] bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl no-print animate-in zoom-in-95 duration-500">
                  <h4 className="font-black text-3xl mb-6 flex items-center gap-5"><Share2 size={36} className="text-pink-400" /> Comparte ahora</h4>
                  <p className="text-slate-400 text-xl mb-10 font-medium">Envía este enlace por WhatsApp:</p>
                  <div className="flex flex-col gap-4 bg-white/10 p-6 rounded-[2rem] border-2 border-white/20">
                    <span className="text-base font-bold truncate text-slate-300 px-2">{publishedUrl}</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(publishedUrl); alert("¡Copiado!"); }}
                      className="w-full py-5 bg-white text-slate-900 rounded-2xl text-xl font-black shadow-xl hover:bg-slate-100 transition"
                    > COPIAR ENLACE </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Historial desde Supabase */}
      {showHistory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-4xl font-black flex items-center gap-4 text-slate-900">
                <FolderHeart size={40} className="text-pink-500" /> Campañas en la Nube
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-4 hover:bg-slate-200 rounded-full transition text-slate-400">
                <X size={40} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
               <div className="flex flex-col gap-4">
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyUp={(e) => e.key === 'Enter' && fetchRemotePosters()}
                      placeholder="Buscar por nombre del paciente..."
                      className="w-full px-6 py-5 pl-14 bg-slate-100 rounded-[2rem] border-2 border-slate-200 outline-none focus:ring-4 focus:ring-amber-400/20 font-bold transition text-xl"
                    />
                    <Search size={28} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button 
                      onClick={fetchRemotePosters}
                      className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-amber-500 text-white rounded-full font-black text-sm shadow-md hover:bg-amber-600 transition"
                    > Buscar </button>
                  </div>
               </div>

               <div className="h-px bg-slate-100 w-full"></div>

               <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {isLoadingHistory ? (
                   <div className="py-20 flex flex-col items-center gap-4">
                      <Loader2 size={48} className="animate-spin text-amber-500" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Consultando base de datos...</p>
                   </div>
                ) : remotePosters.length > 0 ? remotePosters.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleLoadId(p.id)}
                    className="w-full text-left p-6 bg-white border-4 border-slate-50 hover:border-amber-400 hover:bg-amber-50 rounded-[2.5rem] transition-all flex items-center justify-between group cursor-pointer shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center group-hover:bg-amber-100 transition shrink-0">
                         <User size={40} className="text-slate-400 group-hover:text-amber-500" />
                      </div>
                      <div className="flex flex-col gap-1.5 overflow-hidden">
                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-tight truncate">{p.patient_name}</span>
                        <div className="flex flex-col gap-0.5">
                           <div className="flex items-center gap-2">
                             <Activity size={12} className="text-amber-500" />
                             <span className="text-[11px] text-slate-500 font-bold truncate italic">{p.condition || 'Sin diagnóstico registrado'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <MapPin size={12} className="text-slate-400" />
                             <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{p.location || 'Venezuela'}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ChevronRight className="text-slate-200 group-hover:text-amber-500 transition translate-x-0 group-hover:translate-x-1" size={40} />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                    <Search size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-500 font-black text-2xl mb-2">No se encontraron resultados</p>
                    <p className="text-slate-400 text-lg font-bold">Prueba con otro nombre o crea una campaña nueva.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-slate-50 text-center border-t flex justify-center gap-8">
              <button onClick={createNew} className="text-indigo-600 font-black uppercase tracking-[0.2em] text-sm hover:underline flex items-center gap-2">
                <Plus size={18} /> Nueva Campaña
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Cloud size={14} /> Conectado a Supabase
              </div>
            </div>
          </div>
        </div>
      )}

      {showDonationForm && posterId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <DonationForm posterId={posterId} onClose={() => setShowDonationForm(false)} onSuccess={() => { loadDonations(posterId); handleLoadId(posterId); }} />
        </div>
      )}
    </div>
  );
};

export default App;

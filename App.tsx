
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PosterData, ThemeColor, Donation } from './types';
import { PosterPreview } from './components/PosterPreview';
import { Controls } from './components/Controls';
import { DonationForm } from './components/DonationForm';
import { Sparkles, Heart, Share2, Loader2, HandHeart, Pencil, Eye, Save, Plus, History, ChevronRight, Cloud, FolderHeart, X, Search, User, MapPin, Activity } from 'lucide-react';
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
  bankName: "",
  bankAccountNumber: "",
  bankAccountType: "",
  bankAccountHolder: "",
  bankAccountId: "",
  yappyPhone: "",
  yappyHolder: "",
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
      console.error("Error al cargar historial:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const updateUrlSilently = (id: string | null) => {
    try {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set('id', id);
      } else {
        url.searchParams.delete('id');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.warn("No se pudo actualizar la URL del navegador (entorno protegido).");
    }
  };

  const handleLoadId = async (id: string) => {
    if (!id) return;
    setShowHistory(false);
    setIsLoading(true);
    
    try {
      const { data: poster, error } = await supabase.from('posters').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      
      if (poster) {
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
          bankName: poster.bank_name || "",
          bankAccountNumber: poster.bank_account_number || "",
          bankAccountType: poster.bank_account_type || "",
          bankAccountHolder: poster.bank_account_holder || "",
          bankAccountId: poster.bank_account_id || "",
          yappyPhone: poster.yappy_phone || "",
          yappyHolder: poster.yappy_holder || "",
          contactPhones: poster.contact_phones || ["", ""],
          photoUrl: poster.photo_url || null,
          medicalReportUrl: poster.medical_report_url || null,
          thankYouMessage: poster.thank_you_message || "¡Gracias de todo corazón por tu aporte!",
          totalAmount: poster.total_amount || ""
        });
        setTheme(poster.theme as ThemeColor || ThemeColor.PINK);
        setPosterId(id);
        setIsEditing(false);
        setPublishedUrl(window.location.origin + window.location.pathname + '?id=' + id);
        updateUrlSilently(id);
        
        const { data: list } = await supabase.from('donations').select('*').eq('poster_id', id).order('created_at', { ascending: false });
        setDonations(list || []);
      } else {
        alert("La campaña solicitada no existe.");
      }
    } catch (err) {
      console.error("Error cargando poster:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const performSave = async () => {
    if (!data.patientName) {
      alert("Por favor ingresa el nombre del paciente.");
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
      bank_name: data.bankName,
      bank_account_number: data.bankAccountNumber,
      bank_account_type: data.bankAccountType,
      bank_account_holder: data.bankAccountHolder,
      bank_account_id: data.bankAccountId,
      yappy_phone: data.yappyPhone,
      yappy_holder: data.yappyHolder,
      contact_phones: data.contactPhones,
      photo_url: data.photoUrl,
      medical_report_url: data.medicalReportUrl,
      thank_you_message: data.thankYouMessage,
      total_amount: data.totalAmount,
      theme: theme,
      updated_at: new Date()
    };

    try {
      let result;
      if (posterId) {
        const { data: res, error } = await supabase.from('posters').update(dbPayload).eq('id', posterId).select();
        if (error) throw error;
        result = res;
      } else {
        const { data: res, error } = await supabase.from('posters').insert([dbPayload]).select();
        if (error) throw error;
        result = res;
      }

      if (result && result[0]) {
        const newId = result[0].id;
        setPosterId(newId);
        setPublishedUrl(window.location.origin + window.location.pathname + '?id=' + newId);
        updateUrlSilently(newId);
        return newId;
      }
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const handlePublish = async () => {
    const id = await performSave();
    if (id) setIsEditing(false);
  };

  const createNew = () => {
    if (confirm("¿Crear una nueva campaña? Se perderán los cambios no guardados.")) {
      setPosterId(null);
      setData(INITIAL_DATA);
      setPublishedUrl(null);
      setIsEditing(true);
      setShowHistory(false);
      setDonations([]);
      updateUrlSilently(null);
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
        contents: `Redacta una historia médica muy corta y emotiva para un poster de recaudación. Paciente: ${data.patientName}. Diagnóstico: ${data.condition}. Sé respetuoso, directo y humano. Máximo 300 caracteres.`,
      });
      if (response.text) handleDataChange({ description: response.text.trim().replace(/^"|"$/g, '') });
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
      <p className="font-black text-xl text-slate-800">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b sticky top-0 z-50 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={createNew}>
            <Heart size={32} className="text-pink-500 fill-pink-500 group-hover:scale-110 transition" />
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">Solidaridad</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(true)} className="p-3 text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition border border-amber-200" title="Historial">
              <History size={20} />
            </button>

            {posterId && (
              <button onClick={() => setIsEditing(!isEditing)} className={`p-3 rounded-xl transition ${isEditing ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {isEditing ? <Eye size={20} /> : <Pencil size={20} />}
              </button>
            )}

            {isEditing && (
              <>
                <button onClick={performSave} disabled={isSaving} className="p-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                </button>
                <button onClick={handlePublish} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-black text-sm uppercase shadow-lg">
                  <Share2 size={18} /> Publicar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {!posterId && !isEditing ? (
           <div className="max-w-xl mx-auto text-center py-20">
              <Heart size={80} className="text-pink-500 fill-pink-500 mx-auto mb-8 opacity-20" />
              <h2 className="text-5xl font-black mb-6 text-slate-800">Poster Solidario</h2>
              <p className="text-xl text-slate-500 mb-10 font-bold italic">Crea una campaña profesional en minutos para ayudar a quien más lo necesita.</p>
              <button onClick={() => setIsEditing(true)} className="w-full py-6 bg-pink-500 text-white rounded-3xl font-black text-2xl shadow-xl hover:bg-pink-600 transition flex items-center justify-center gap-4">
                <Plus size={32} /> Nueva Campaña
              </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-8 no-print">
              {!isEditing && posterId ? (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-left-4">
                  <h2 className="text-4xl font-black text-slate-800 mb-8 italic">Apoya esta causa</h2>
                  <button onClick={() => setShowDonationForm(true)} className="w-full py-6 bg-pink-500 text-white rounded-2xl font-black hover:bg-pink-600 transition shadow-lg flex items-center justify-center gap-4 text-2xl">
                    <HandHeart size={32} /> Registrar Aporte
                  </button>
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest">Aportes Recientes</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {donations.length > 0 ? donations.map((d, i) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800">{d.donor_name}</span>
                            {d.message && <p className="text-xs text-slate-500 italic font-medium">"{d.message}"</p>}
                          </div>
                          <span className="font-black text-green-600 bg-green-50 px-4 py-1.5 rounded-full text-sm">${d.amount}</span>
                        </div>
                      )) : <p className="text-center text-slate-300 py-10 font-bold italic">No hay registros aún.</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-400">Configuración</h2>
                    <button onClick={refineDescription} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black border border-indigo-100">
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} IA Historia
                    </button>
                  </div>
                  <Controls data={data} onChange={handleDataChange} theme={theme} onThemeChange={setTheme} />
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col items-center">
              <PosterPreview data={data} theme={theme} donations={donations} />
              
              {publishedUrl && !isEditing && (
                <div className="mt-8 w-full max-w-md bg-slate-900 p-8 rounded-3xl text-white shadow-2xl no-print text-center">
                  <p className="text-slate-400 text-sm mb-4 font-black uppercase tracking-widest">Enlace de la Campaña</p>
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/10 p-4 rounded-xl text-xs font-mono truncate">{publishedUrl}</div>
                    <button onClick={() => { navigator.clipboard.writeText(publishedUrl); alert("¡Copiado!"); }} className="py-4 bg-white text-slate-900 rounded-xl font-black uppercase text-sm">Copiar Enlace</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showHistory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-black flex items-center gap-2"><FolderHeart size={24} className="text-pink-500" /> Historial</h3>
              <button onClick={() => setShowHistory(false)}><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <input type="text" placeholder="Buscar campaña..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && fetchRemotePosters()} className="w-full px-4 py-3 bg-slate-100 rounded-xl mb-4 text-sm font-bold" />
              {isLoadingHistory ? <Loader2 className="animate-spin mx-auto text-slate-300 my-10" /> : remotePosters.map(p => (
                <div key={p.id} onClick={() => handleLoadId(p.id)} className="p-4 border rounded-2xl hover:bg-slate-50 cursor-pointer flex justify-between items-center group">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800">{p.patient_name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.condition || 'Sin diagnóstico'}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition" />
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t text-center">
               <button onClick={createNew} className="text-indigo-600 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 mx-auto"><Plus size={14} /> Crear Nueva</button>
            </div>
          </div>
        </div>
      )}

      {showDonationForm && posterId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <DonationForm posterId={posterId} onClose={() => setShowDonationForm(false)} onSuccess={() => { handleLoadId(posterId); }} />
        </div>
      )}
    </div>
  );
};

export default App;

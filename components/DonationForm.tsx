
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Heart, X, CheckCircle2, Loader2, Image as ImageIcon, Info } from 'lucide-react';

interface DonationFormProps {
  posterId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({ posterId, onClose, onSuccess }) => {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Zelle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsSubmitting(true);

    let proof_url = '';

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${posterId}/${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('proofs')
          .getPublicUrl(fileName);
        
        proof_url = publicUrl;
      }

      const { error } = await supabase
        .from('donations')
        .insert([{
          poster_id: posterId,
          donor_name: donorName || 'Anónimo',
          amount: parseFloat(amount),
          message: message,
          payment_method: paymentMethod,
          proof_url: proof_url
        }]);

      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error al registrar:", err);
      alert("Error al registrar el aporte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Aporte Registrado!</h2>
        <p className="text-slate-500">Tu generosidad es una bendición.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Heart size={20} className="text-pink-500 fill-pink-500" />
          Registrar Aporte
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
          <X size={20} />
        </button>
      </div>

      <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
        <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] font-semibold text-amber-800 leading-relaxed italic">
          <span className="font-black uppercase block mb-1">Nota importante:</span>
          Solo utiliza esta sección para reportar o registrar tu aporte una vez lo hayas realizado en alguno de los instrumentos indicados. En caso de que no tengas acceso a ninguno de ellos, comunícate directamente con los números de contacto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest mb-1 block">Método Utilizado</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            {['Zelle', 'Pago Movil', 'Banco', 'Yappy'].map(method => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-2 rounded-lg text-[10px] font-bold transition ${
                  paymentMethod === method ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Nombre del Donante</label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition text-sm"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Monto Aportado ($)</label>
          <input
            type="number"
            required
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition font-bold text-lg"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Comprobante / Captura</label>
          <div className="mt-1 relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
              imagePreview ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50 group-hover:border-pink-400'
            }`}>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} className="h-24 w-auto rounded-lg object-contain" />
                </div>
              ) : (
                <>
                  <ImageIcon size={24} className="text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold">Adjuntar captura del pago</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Mensaje de Apoyo</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition min-h-[60px] resize-none text-sm font-medium"
            placeholder="Envía un mensaje de fuerzas..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} className="fill-white" />}
          {isSubmitting ? "Registrando..." : "Confirmar mi Reporte"}
        </button>
      </form>
    </div>
  );
};

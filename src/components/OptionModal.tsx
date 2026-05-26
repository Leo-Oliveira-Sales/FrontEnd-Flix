import React, { useState } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

interface OptionModalProps {
  show: boolean;
  handleClose: () => void;
  onSaveSuccess: () => void;
  type: 'genre' | 'actor';
}

export default function OptionModal({ show, handleClose, onSaveSuccess, type }: OptionModalProps) {
  const [name, setName] = useState('');
  const [errorHeader, setErrorHeader] = useState('');

  const title = type === 'genre' ? 'Adicionar Gênero' : 'Adicionar Ator';
  const label = type === 'genre' ? 'Nome do Gênero' : 'Nome do Ator';
  const endpoint = type === 'genre' ? 'genres/' : 'actors/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHeader('');

    const payload = { name: name, nome: name };

    try {
      await api.post(endpoint, payload);
      onSaveSuccess();
      handleClose();
      setName('');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setErrorHeader('Ocorreu um erro ao salvar os dados. Verifique a conexão com o servidor.');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 w-full h-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            {title}
          </h2>
          <button onClick={handleClose} type="button" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6">
            {errorHeader && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded-md text-sm border border-red-500/50 font-medium mb-4">
                {errorHeader}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">{label}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Digite o nome..."
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-600"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-3 rounded-b-lg">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-5 py-2 text-sm font-bold text-zinc-300 bg-transparent border border-zinc-600 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
            >
              CANCELAR
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors shadow-md hover:shadow-red-600/20"
            >
              SALVAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

interface MovieModalProps {
  show: boolean;
  handleClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movie: any | null; 
  onSaveSuccess: () => void;
}

export default function MovieModal({ show, handleClose, movie, onSaveSuccess }: MovieModalProps) {
  const [titulo, setTitulo] = useState('');
  const [anoLancamento, setAnoLancamento] = useState<string | number>('');
  const [resumo, setResumo] = useState('');
  
  // DRF costuma esperar IDs em relacionamentos (ex: chave estrangeira vira integer, N:N vira array de ints)
  const [generoId, setGeneroId] = useState<string | number>('');
  const [atoresIds, setAtoresIds] = useState<number[]>([]);

  // Listas de opções carregadas da API
  const [genres, setGenres] = useState<any[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [errorHeader, setErrorHeader] = useState('');

  // Toda vez que o modal for exibido...
  useEffect(() => {
    if (show) {
      setErrorHeader('');
      fetchOptions(); // Carrega atores e gêneros

      // Se houver um filme sendo editado (Update)
      if (movie) {
        setTitulo(movie.titulo || movie.title || '');
        setAnoLancamento(movie.ano_lancamento || movie.release_date || '');
        setResumo(movie.resumo || movie.resume || '');
        setGeneroId(movie.genero || movie.genre || '');
        setAtoresIds(movie.atores || movie.actors || []);
      } else {
        // Se for form de criação (Create), zera tudo
        setTitulo('');
        setAnoLancamento('');
        setResumo('');
        setGeneroId('');
        setAtoresIds([]);
      }
    }
  }, [show, movie]);

  const fetchOptions = async () => {
    try {
      const [genresRes, actorsRes] = await Promise.all([
        api.get('genres/'),
        api.get('actors/')
      ]);
      // Ajuste se o seu DRF usa paginação padrão: response.data.results
      setGenres(genresRes.data.results || genresRes.data);
      setActors(actorsRes.data.results || actorsRes.data);
    } catch (err) {
      console.error("Erro ao buscar opções dos selects: ", err);
      // Aqui a gente avisa na UI e foca a atenção no log console
      setErrorHeader("Erro de requisição: Não foi possível carregar gêneros e atores. Verifique o servidor Django e CORS.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHeader('');

    // Validações do Front-End
    if (Number(anoLancamento) < 1990) {
      setErrorHeader('O ano de lançamento deve ser maior ou igual a 1990.');
      return;
    }
    if (resumo.length > 500) {
      setErrorHeader(`O resumo deve ter no máximo 500 caracteres (Atual: ${resumo.length}).`);
      return;
    }

    // Montando a data no formato YYYY-MM-DD exigido pelo DateField do Django
    const formattedDate = `${anoLancamento}-01-01`;

    // Estruturando o payload exatamente com os nomes do seu Model Django
    const payload = {
      title: titulo, 
      genre: Number(generoId),      // ID do gênero (Chave Estrangeira)
      release_date: formattedDate,  // DateField espera uma string de data
      actors: atoresIds,            // Array de IDs (Many-to-Many)
      resume: resumo
    };

    try {
      if (movie && movie.id) {
        await api.put(`movies/${movie.id}/`, payload);
      } else {
        await api.post('movies/', payload);
      }
      onSaveSuccess(); 
      handleClose();   
    } catch (err: any) {
      console.error('Erro ao salvar o filme:', err);
      setErrorHeader('Não foi possível salvar o filme. Verifique os dados e o console do Django.');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto w-full h-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            {movie ? 'Editar Título' : 'Adicionar Novo Título'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar">
            
            {errorHeader && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded-md text-sm border border-red-500/50 font-medium">
                {errorHeader}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1">Título do Filme</label>
              <input
                type="text"
                placeholder="Digite o título..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">Ano de Lançamento</label>
                <input
                  type="number"
                  value={anoLancamento}
                  onChange={(e) => setAnoLancamento(e.target.value)}
                  min="1990"
                  required
                  className="w-full px-4 py-2.5 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">Gênero</label>
                <select
                  value={generoId}
                  onChange={(e) => setGeneroId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-600"
                >
                  <option value="">Selecione um gênero...</option>
                  {genres && genres.map((g) => (
                    <option key={g.id} value={g.id}>{g.name || g.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1">Resumo / Sinopse</label>
              <textarea
                rows={4}
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                required
                placeholder="Digite a sinopse do filme..."
                className="w-full px-4 py-2.5 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-600 resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-semibold ${resumo.length > 500 ? "text-red-500" : "text-zinc-500"}`}>
                  {resumo.length}/500 {resumo.length > 500 ? '(Excedido)' : ''}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1">
                Atores <span className="font-normal text-zinc-500">(Use Ctrl/Cmd para múltipla escolha)</span>
              </label>
              <select
                multiple
                value={atoresIds.map(String)}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  const selectedIds = options.map(opt => Number(opt.value));
                  setAtoresIds(selectedIds);
                }}
                className="w-full px-4 py-2.5 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white flex-grow min-h-[140px] appearance-auto"
              >
                {actors && actors.map((a) => (
                  <option key={a.id} value={a.id} className="py-1 px-2 checked:bg-red-600/50 hover:bg-zinc-800 rounded">{a.name || a.nome}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-3 rounded-b-lg">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-bold text-zinc-300 bg-transparent border border-zinc-600 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
            >
              CANCELAR
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors shadow-md hover:shadow-red-600/20"
            >
              {movie ? 'SALVAR ALTERAÇÕES' : 'CRIAR TÍTULO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

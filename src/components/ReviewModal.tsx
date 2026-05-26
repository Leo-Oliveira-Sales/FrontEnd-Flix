import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  show: boolean;
  movie: any | null;
  handleClose: () => void;
  onSaveReview: (movieId: number, stars: number, comment: string) => void;
}

export default function ReviewModal({ show, movie, handleClose, onSaveReview }: ReviewModalProps) {
  const [stars, setStars] = useState<number>(0);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (show) {
      setStars(0);
      setHoverStars(0);
      setComment('');
    }
  }, [show]);

  if (!show || !movie) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    onSaveReview(movie.id, stars, comment);
    handleClose();
  };

  const currentReviews = movie.reviews || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 w-full h-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Star className="w-5 h-5 text-red-600" fill="currentColor" />
            Avaliações: {movie.titulo || movie.title}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {/* Left Side: Review Form */}
          <div className="flex-1 p-6 border-r border-zinc-800 flex flex-col custom-scrollbar overflow-y-auto">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Deixe sua avaliação</h3>
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
              
              <div className="mb-6 flex flex-col items-center">
                <label className="block text-sm font-semibold text-zinc-400 mb-3">Sua Nota</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverStars(s)}
                      onMouseLeave={() => setHoverStars(0)}
                      onClick={() => setStars(s)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${s <= (hoverStars || stars) ? 'text-yellow-500 fill-current' : 'text-zinc-700'}`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-zinc-500 mt-2 font-medium">
                  {stars === 0 ? 'Selecione as estrelas' : stars === 1 ? '1 Estrela - Péssimo' : stars === 2 ? '2 Estrelas - Ruim' : stars === 3 ? '3 Estrelas - Bom' : stars === 4 ? '4 Estrelas - Muito Bom' : '5 Estrelas - Excelente!'}
                </span>
              </div>

              <div className="flex-grow mb-4 flex flex-col">
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Comentário (opcional)</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="O que você achou do filme?..."
                  className="w-full flex-grow px-4 py-3 bg-black border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-600 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 text-sm font-bold text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors shadow-md hover:shadow-red-600/20 uppercase"
              >
                Enviar Avaliação
              </button>
            </form>
          </div>

          {/* Right Side: Existing Reviews */}
          <div className="flex-1 p-6 bg-zinc-900/30 custom-scrollbar overflow-y-auto">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Comentários da Comunidade</h3>
            
            {currentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 opacity-50">
                <MessageSquare className="w-10 h-10 text-zinc-600 mb-3" />
                <p className="text-zinc-400 text-sm">Nenhuma avaliação ainda.<br/>Seja o primeiro a avaliar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentReviews.map((rev: any, idx: number) => (
                  <div key={idx} className="bg-black/40 border border-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.stars ? 'text-yellow-500 fill-current' : 'text-zinc-700'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">{rev.date || 'Hoje'}</span>
                    </div>
                    {rev.comment ? (
                      <p className="text-zinc-300 text-sm leading-relaxed">{rev.comment}</p>
                    ) : (
                      <p className="text-zinc-500 text-sm italic">Sem comentário.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieModal from '../components/MovieModal';
import OptionModal from '../components/OptionModal';
import ReviewModal from '../components/ReviewModal';
import { Film, LogOut, Plus, Edit2, Trash2, Star, Loader2, Tags, Users } from 'lucide-react';

export default function MovieCatalog() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [errorHeader, setErrorHeader] = useState('');
  
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [optionType, setOptionType] = useState<'genre'|'actor'>('genre');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMovie, setReviewMovie] = useState<any | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorHeader('');

    try {
      const response = await api.get('movies/');
      // Em DRF, se você usar PageNumberPagination, os dados estarão em .results
      setMovies(response.data.results || response.data);
    } catch (err: any) {
      console.error("Erro na busca de Filmes:", err);
      if (err?.response?.status === 401) {
        navigate('/'); // Volta p/ Login se o token expirar ou for inválido
      } else {
        setErrorHeader("Falha de conexão com a API de Filmes. O backend Django está online e liberou o CORS?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedMovie(null); // set null for pure creation
    setShowModal(true);
  };

  const handleEditClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Exclusão irreversível: Tem certeza que deseja apagar este filme?')) {
      try {
        await api.delete(`movies/${id}/`);
        fetchMovies(); // Refresh list after successful delete
      } catch (err) {
        console.error("Erro deletando o filme:", err);
        alert("Erro ao excluir filme! Status Code logado no console.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const handleOpenOptionModal = (type: 'genre'|'actor') => {
    setOptionType(type);
    setShowOptionModal(true);
  };

  const handleCardClick = (movie: any) => {
    setReviewMovie(movie);
    setShowReviewModal(true);
  };

  const handleSaveReview = async (movieId: number, stars: number, comment: string) => {
    try {
      await api.post(`movies/${movieId}/reviews/`, { stars, comment });
      fetchMovies();
      setReviewMovie(null); // Fecha ou atualiza estado
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      // Fallback para UI
      setMovies(prevMovies => prevMovies.map(movie => {
        if (movie.id === movieId) {
          const newReview = {
            stars,
            comment,
            date: new Date().toLocaleDateString('pt-BR')
          };
          const updatedReviews = [newReview, ...(movie.reviews || [])];
          const totalStars = updatedReviews.reduce((acc: any, r: any) => acc + r.stars, 0);
          const newRate = (totalStars / updatedReviews.length).toFixed(1);
          
          const updatedMovie = {
            ...movie,
            reviews: updatedReviews,
            rate: parseFloat(newRate)
          };
          setReviewMovie(updatedMovie); 
          return updatedMovie;
        }
        return movie;
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] pb-12 font-sans text-gray-100 selection:bg-red-600 selection:text-white">
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-40 border-b border-zinc-800 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-red-600 rounded-md p-1.5 flex items-center justify-center">
                <Film className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-3xl tracking-tighter uppercase text-red-600">CineManager</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-zinc-400 font-medium hover:text-white transition-colors bg-transparent hover:bg-zinc-800 px-3 py-2 rounded-md text-sm"
              >
                <LogOut className="w-4 h-4" />
                Desconectar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Meu Catálogo
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => handleOpenOptionModal('genre')}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium py-2 px-4 rounded-md transition-all hover:border-zinc-500"
            >
              <Tags className="w-4 h-4" />
              <span>Gênero</span>
            </button>
            <button 
              onClick={() => handleOpenOptionModal('actor')}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium py-2 px-4 rounded-md transition-all hover:border-zinc-500"
            >
              <Users className="w-4 h-4" />
              <span>Ator</span>
            </button>
            <button 
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-md shadow-lg transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Adicionar Filme
            </button>
          </div>
        </div>

        {errorHeader && (
          <div className="bg-red-900/50 text-red-100 border-l-4 border-red-500 p-4 rounded mb-6 font-medium">
            {errorHeader}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Carregando títulos...</p>
          </div>
        ) : !movies || movies.length === 0 ? (
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-12 flex flex-col items-center justify-center text-center">
            <Film className="w-16 h-16 text-zinc-700 mb-4" />
            <h4 className="text-xl font-bold text-zinc-300 mb-2">Sua lista está vazia!</h4>
            <p className="text-zinc-500 max-w-sm">Adicione seu primeiro título para começar a gerenciar seu catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => handleCardClick(movie)}
                className="bg-zinc-900 rounded-md border border-zinc-800 overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.3)] hover:border-red-600/50 group cursor-pointer relative"
              >
                
                {/* Efeito simulado de "Capa" do filme */}
                <div className="h-2 bg-gradient-to-r from-red-600 to-red-900 w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h3 className="font-bold text-gray-100 leading-tight text-lg drop-shadow-md">
                      {movie.titulo || movie.title}
                    </h3>
                    {movie.rate && movie.rate > 0 ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-black/50 border border-zinc-700 text-xs font-bold whitespace-nowrap ${
                        movie.rate >= 4 ? 'text-green-500' : 
                        movie.rate >= 2.5 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        <Star className="w-3 h-3 fill-current" />
                        {movie.rate % 1 === 0 ? movie.rate + '.0' : movie.rate}
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <span className="border border-zinc-600 px-1.5 py-0.5 rounded-sm">{movie.ano_lancamento || movie.release_date}</span>
                    <span className="text-red-500 font-bold text-sm flex-grow text-right">HD</span>
                  </div>
                  
                  <p className="text-zinc-400 text-sm line-clamp-4 flex-grow leading-relaxed">
                    {movie.resumo || movie.resume || 'Resumo indisponível'}
                  </p>
                </div>

                {/* Opções (Escondidas normalmente, aparecem no hover ou em telas pequenas) */}
                <div className="px-5 py-3 bg-black/60 border-t border-zinc-800 flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditClick(movie); }}
                    className="flex items-center justify-center p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    title="Editar Filme"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(movie.id); }}
                    className="flex items-center justify-center p-2 text-red-500 hover:text-red-400 hover:bg-zinc-800 rounded-full transition-colors"
                    title="Apagar Registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Controller */}
        <MovieModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          movie={selectedMovie}
          onSaveSuccess={fetchMovies}
        />

        {/* Option Modal (Gênero/Ator) */}
        <OptionModal
          show={showOptionModal}
          handleClose={() => setShowOptionModal(false)}
          onSaveSuccess={() => {
            alert('Registro adicionado com sucesso!');
          }}
          type={optionType}
        />

        {/* Review Modal */}
        <ReviewModal
          show={showReviewModal}
          movie={reviewMovie}
          handleClose={() => setShowReviewModal(false)}
          onSaveReview={handleSaveReview}
        />
      </div>
    </div>
  );
}

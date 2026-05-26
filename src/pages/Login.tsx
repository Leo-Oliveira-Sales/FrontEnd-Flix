import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('leodev');
  const [password, setPassword] = useState('123456789');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { username, password };
      console.log('Enviando payload para autenticação (JSON):', JSON.stringify(payload));

      // Ajuste a rota para bater com sua URL do Django. 
      const response = await api.post('authentication/token', payload);
      
      // Destruturação padrão do JWT do DRF
      const { access, refresh } = response.data;

      if (access) {
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        navigate('/movies');
      } else {
        // Caso seu DRF não retorne as chaves access/refresh exatas, tente um fallback:
        localStorage.setItem('access_token', response.data.token);
        navigate('/movies');
      }
    } catch (err: any) {
      console.error('Erro de autenticação - Detalhes completos:', err);
      if (err.message === 'Network Error') {
        setError('Erro de Rede: O navegador bloqueou a requisição (provavelmente erro de CORS) ou o Django está desligado. Verifique se o django-cors-headers está configurado.');
      } else if (err.response) {
        console.error('Dados da resposta de erro do Django:', err.response.data);
        if (err.response.status === 401) {
          setError('Credenciais inválidas: Usuário ou senha incorretos.');
        } else {
          setError(`Erro do Servidor (HTTP ${err.response.status}). Verifique o log do Django no terminal.`);
        }
      } else {
        setError('Erro desconhecido ao tentar conectar com a API.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] flex flex-col justify-center items-center p-4 selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-md bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 border border-zinc-800">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-2 uppercase text-red-600">CineManager</h1>
          <p className="text-zinc-400 font-medium tracking-wide">Acesso ao Sistema</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6 text-sm border border-red-500/50 font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              placeholder="Insira seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Insira sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500 transition-all text-white placeholder-zinc-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-md transition-all shadow-lg mt-6 hover:shadow-red-600/20 active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

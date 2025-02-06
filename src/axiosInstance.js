import Axios from 'axios';
import { useServerStatusStore } from '@/stores/serverStatusStore';
import { showToast } from '@/composables/toastUtils';
const axiosInstance = Axios.create({
  baseURL: 'http://192.168.3.18:8080/api',
  timeout: 5000, // Define um timeout de 10 segundos
});
// Lista de rotas públicas
const publicPaths = [
  '/password/send-reset-code',
  '/password/validate-reset-code',
  '/password/update-password',
];
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtém o token do localStorage

    // Ignora autenticação para rotas públicas
    if (!publicPaths.some((path) => config.url.includes(path))) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Marca que uma requisição está sendo enviada
    const serverStatusStore = useServerStatusStore();
    serverStatusStore.setRequestInProgress(true);
    return config;
  },
  (error) => {
    // Marca que não há requisição em andamento devido ao erro
    const serverStatusStore = useServerStatusStore();
    serverStatusStore.setRequestInProgress(false);
    return Promise.reject(error);
  }
);
// Interceptor de Resposta
axiosInstance.interceptors.response.use(
  (response) => {
    const serverStatusStore = useServerStatusStore();
    serverStatusStore.isOffline = false; // Servidor online
    serverStatusStore.setRequestInProgress(false);

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const serverStatusStore = useServerStatusStore();
    // Marca que a requisição foi concluída, mesmo com erro
    serverStatusStore.setRequestInProgress(false);

    // Se não houver resposta, o servidor pode estar offline
    if (!error.response) {
      serverStatusStore.isOffline = true;
      showToast("erro", "Servidor indisponível. Verifique sua conexão.");
      return Promise.reject(new Error("Servidor indisponível."));
    }

    // Ignora redirecionamento para login em rotas públicas
    if (publicPaths.some((path) => error.config.url.includes(path))) {
      return Promise.reject(error);
    }
    /*
        if (status === 400) {
          // Exibir erro apenas se houver uma mensagem clara do backend
          const errorMessage = error.response?.data?.message || "Requisição inválida.";
          showToast('erro', errorMessage);
          return Promise.reject(new Error(errorMessage));
        }
    */

    if (status === 400) {
      // Se houver múltiplos erros, junta as mensagens em uma única string
      const errors = error.response?.data?.errors;
      const errorMessage = Array.isArray(errors) ? errors.join("\n") : "Requisição inválida.";
      showToast('erro', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    if (status === 401) {
      // Token inválido ou expirado ou credenciais inválidas
      const currentRouteName = router.currentRoute.value.name;
      if (currentRouteName !== 'login') {
        showToast('erro', 'Sua sessão expirou. Faça login novamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Redireciona para a página de login
      }
    } else if (status === 403) {
      // Acesso negado
      showToast('erro', 'Você não tem permissão para acessar este recurso.');
    } else if (status >= 500) {
      // Erro no servidor
      showToast('erro', 'Erro no servidor. Tente novamente mais tarde.');
    } else {
      // Outros erros
      showToast('erro', error.response?.data?.message || 'Ocorreu um erro inesperado.');
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;

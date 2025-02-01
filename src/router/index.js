import { createRouter, createWebHistory } from 'vue-router';
import { useServerStatusStore } from '@/stores/serverStatusStore';
import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import ClientesView from '@/views/ClientesView.vue';
import ClienteFisicoView from '@/views/ClienteFisicoView.vue';
import ClienteJuridicoView from '@/views/ClienteJuridicoView.vue';
import FornecedoresView from '@/views/FornecedoresView.vue';
import FornecedorFisicoView from '@/views/FornecedorFisicoView.vue';
import FornecedorJuridicoView from '@/views/FornecedorJuridicoView.vue';
import ParceirosView from '@/views/ParceirosView.vue';
import ParceiroFisicoView from '@/views/ParceiroFisicoView.vue';
import ParceiroJuridicoView from '@/views/ParceiroJuridicoView.vue';
import ColaboradoresView from '@/views/ColaboradoresView.vue';
import ColaboradorView from '@/views/ColaboradorView.vue';
import UsuariosView from '@/views/UsuariosView.vue';
import UsuarioView from '@/views/UsuarioView.vue';
import ServerErrorView from '@/views/ServerErrorView.vue';
import PasswordRecoverEmailView from '@/views/PasswordRecoverEmailView.vue';
import PasswordRecoverCodeView from '@/views/PasswordRecoverCodeView.vue';
import PasswordRecoverResetView from '@/views/PasswordRecoverResetView.vue';
import axiosInstance from '@/axiosInstance';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { layout: 'SimpleLayout' }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesView,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/clientes/fisico/:fisicoId?',
      name: 'cliente-fisico',
      component: ClienteFisicoView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/clientes/juridico/:juridicoId?',
      name: 'cliente-juridico',
      component: ClienteJuridicoView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/fornecedores',
      name: 'fornecedores',
      component: FornecedoresView,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/fornecedores/fisico/:fisicoId?',
      name: 'fornecedor-fisico',
      component: FornecedorFisicoView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/fornecedores/juridico/:juridicoId?',
      name: 'forncedor-juridico',
      component: FornecedorJuridicoView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/parceiros',
      name: 'parceiros',
      component: ParceirosView,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/parceiros/fisico/:fisicoId?',
      name: 'parceiro-fisico',
      component: ParceiroFisicoView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/parceiros/juridico/:juridicoId?',
      name: 'parceiro-juridico',
      component: ParceiroJuridicoView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/colaboradores',
      name: 'colaboradores',
      component: ColaboradoresView,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/colaborador/:colaboradorId?',
      name: 'colaborador',
      component: ColaboradorView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosView,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/usuario/:usuarioId?',
      name: 'usuario',
      component: UsuarioView,
      props: true,
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/server-error',
      name: 'server-error',
      component: ServerErrorView,
      meta: { layout: 'SimpleLayout' },
    }, {
      path: '/recover-password',
      name: 'recover-password-email',
      component: PasswordRecoverEmailView,
      meta: { layout: 'SimpleLayout' }
    },
    {
      path: '/recover-password/code',
      name: 'recover-password-code',
      component: PasswordRecoverCodeView,
      meta: { layout: 'SimpleLayout' }
    },
    {
      path: '/recover-password/reset',
      name: 'recover-password-reset',
      component: PasswordRecoverResetView,
      meta: { layout: 'SimpleLayout' }
    },
  ],
});
router.beforeEach(async (to, from, next) => {
  const serverStatusStore = useServerStatusStore();
  const token = localStorage.getItem('token');
  // Lista de rotas públicas que não requerem autenticação
  const publicRoutes = ['recover-password-email', 'recover-password-code', 'recover-password-reset'];
  try {    
    await serverStatusStore.checkServerStatus();
  } catch (err) {
    console.error('[Router] Falha ao verificar status do servidor:', err.message);
  }
  // Redirecionar para a página de erro se o servidor estiver offline
  if (serverStatusStore.isOffline && to.name !== 'server-error') {
    console.warn('[Router] Servidor offline. Redirecionando para /server-error.');
    next({ name: 'server-error' });
    return;
  }
   // Permitir acesso a rotas públicas sem autenticação
   if (publicRoutes.includes(to.name)) {
    next();
    return;
  }
  // Redirecionar para a página inicial se o servidor voltar a ficar online
  if (!serverStatusStore.isOffline && to.name === 'server-error') {    
    next({ name: 'home' });
    return;
  }
  // Redirecionar para login se o usuário não estiver autenticado
  if (!token && to.name !== 'login' && to.name !== 'server-error') {    
    next({ name: 'login' });
  } else if (token) {
    try {
      await axiosInstance.get('/usuarios/validate-token');
      next();
    } catch {
      localStorage.removeItem('token');
      next({ name: 'login' });
    }
  } else {
    next();
  }
});
export default router;
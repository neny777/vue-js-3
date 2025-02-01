import { createApp } from 'vue';
import App from './App.vue';
import VueTheMask from 'vue-the-mask';
import '@fontsource/source-sans-3';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/700.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';
import './assets/css/adminlte.css';
import './assets/css/custom.css';
import './assets/js/adminlte.js';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);
const pinia = createPinia();

// Inicializar OverlayScrollbars após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.scrollable-element');
    if (elements.length) {
        OverlayScrollbars(elements, {
            scrollbars: {
                autoHide: 'scroll',
                theme: 'os-theme-light',
            },
        });
    }
});


app.use(pinia);
app.use(VueTheMask);
app.use(router);
app.mount('#app');

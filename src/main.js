// Aguarda o carregamento dos scripts
const { createApp } = Vue;
const { createPinia } = Pinia;
const { createRouter, createWebHistory } = VueRouter;

// Componente principal
const App = {
  template: `
    <div id="app">
      <Navigation />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  `,
  components: {
    Navigation: window.Navigation
  }
};

// Configuração do roteador
const routes = [
  {
    path: '/',
    name: 'Home',
    component: window.Home
  },
  {
    path: '/deck/:id',
    name: 'DeckView',
    component: window.DeckView,
    props: true
  },
  {
    path: '/study/:id',
    name: 'StudyMode',
    component: window.StudyMode,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Inicialização da aplicação
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

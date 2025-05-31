import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DeckView from '../views/DeckView.vue'
import StudyMode from '../views/StudyMode.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/deck/:id',
    name: 'DeckView',
    component: DeckView,
    props: true
  },
  {
    path: '/study/:id',
    name: 'StudyMode',
    component: StudyMode,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FreeKick from '../views/FreeKick.vue'
import Pinball from '../views/Pinball.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/freekick',
    name: 'FreeKick',
    component: FreeKick
  },
  {
    path: '/pinball',
    name: 'Pinball',
    component: Pinball
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
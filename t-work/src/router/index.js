import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import LoginPage from '@/components/authentication/LoginPage.vue'
import RegistrationPage from '@/components/authentication/RegistrationPage.vue'
import MainPage from '@/components/main-page/MainPage.vue'
import SettingsPage from '@/components/main-page/SettingsPage.vue'
import CreateProjectPage from '@/components/project-page/CreateProjectPage.vue'
import ProjectDetailsPage from '@/components/project-page/ProjectMainPage.vue' 


const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/registration',
    name: 'Registration',
    component: RegistrationPage
  },
  {
    path: '/main',
    name: 'main',
    component: MainPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-project',
    name: 'createProject',
    component: CreateProjectPage,
    meta: { requiresAuth: true }
  },
    {
    path: '/project/:id',
    name: 'projectDetails',
    component: ProjectDetailsPage,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        next();
      } else {
        next({ name: 'Login' });
      }
    });
  } else {
    next();
  }
});

export default router;

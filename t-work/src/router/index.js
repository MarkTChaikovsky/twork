import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from 'firebase/auth';

// Імпорт сторінок
import LoginPage from '@/components/authentication/LoginPage.vue';
import RegistrationPage from '@/components/authentication/RegistrationPage.vue';
import MainPage from '@/components/main-page/MainPage.vue';
import SettingsPage from '@/components/main-page/SettingsPage.vue';
import CreateProjectPage from '@/components/project-page/CreateProjectPage.vue';
import ProjectsPage from '@/components/main-page/ProjectsPage.vue';
import ProjectDetailsPage from '@/components/project-page/ProjectMainPage.vue';

// Оголошення маршрутів
const routes = [
  {
    path: '/',
    redirect: '/login', // Перенаправляємо гостей на сторінку входу за замовчуванням
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/registration',
    name: 'Registration',
    component: RegistrationPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/main',
    name: 'main',
    component: MainPage,
    meta: { requiresAuth: true },
    redirect: '/main/projects',
    children: [
      {
        path: 'projects',
        name: 'projects',
        component: ProjectsPage,
      },

      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
      },
      {
        path: 'create-project',
        name: 'createProject',
        component: CreateProjectPage,
      },
      {
        path: 'project/:id',
        name: 'projectDetails',
        component: ProjectDetailsPage,
      },
    ],
  },
];

// Ініціалізація роутера
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Middleware для обробки доступу до маршрутів
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Якщо маршрут вимагає авторизації
    if (user) {
      next();
    } else {
      next({ name: 'Login' }); // Перенаправляємо на логін
    }
  }  else {
    next(); // Дозволяємо перехід
  }
});

export default router;

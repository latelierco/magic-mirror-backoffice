
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

// import { routes } from 'vue-router/auto-routes'
import index from '../pages/index';
// import users from '../pages/users';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // routes,
  routes: [
    {
      path: '/',
      name: 'home',
      component: index
    },
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: () => import('../pages/dashboard.vue')
    // },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../pages/users-list.vue')
    },
    {
      path: '/user/:id',
      name: 'UserById',
      props: true,
      component: () => import('../pages/user-update.vue')
    },
    {
      path: '/user/add',
      name: 'UserAdd',
      props: true,
      component: () => import('../pages/user-add.vue')
    },
    {
      path: '/user/photo/add/:id',
      name: 'UserPhotoAdd',
      props: true,
      component: () => import('../pages/user-photo-add.vue')
    },
    // 
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router

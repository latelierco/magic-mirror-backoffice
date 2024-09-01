
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
    {
      path: '/users',
      name: 'Users',
      component: () => import('../pages/user-list-page.vue')
    },
    {
      path: '/users/:id',
      name: 'UserById',
      props: true,
      component: () => import('../pages/user-update-page.vue')
    },
    {
      path: '/users/add',
      name: 'UserAdd',
      props: true,
      component: () => import('../pages/user-add-page.vue')
    },
    {
      path: '/users/:id/photo/add',
      name: 'UserPhotoAdd',
      props: true,
      component: () => import('../pages/user-add-photo-page.vue')
    }, 
    {
      path: '/contents',
      name: 'ContentList',
      props: true,
      component: () => import('../pages/content-list-page.vue')
    },
    {
      path: '/contents/add',
      name: 'ContentAdd',
      props: true,
      component: () => import('../pages/content-add-page.vue')
    },
    {
      path: '/contents/:id',
      name: 'ContentsById',
      props: true,
      component: () => import('../pages/content-update-page.vue')
    },
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

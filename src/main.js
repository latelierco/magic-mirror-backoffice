/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Composables
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'

// Components
import App from './App.vue'

import { firebaseApp } from './firebase'


const app = createApp(App)

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // we will see other modules later on
    VueFireAuth(),
  ],
})


registerPlugins(app)

app.mount('#app')

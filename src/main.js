/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */


import firebase from './firebase'


// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
const app = createApp(App)

app.use(firebase)

registerPlugins(app)

app.mount('#app')

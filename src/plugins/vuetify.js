/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '../assets/css/latelier-styles.css'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    // defaultTheme: 'dark',
    defaultTheme: 'atelierTheme',
    themes: {
      dark: false,
      options: { customProperties: true },
      atelierTheme: {
        colors: {
          background: '#06326C',
          'surface-variant': '#fff',
          'surface-light': '#06326C',
          'surface': '#06326C',
        },
      }
    }
  },
})

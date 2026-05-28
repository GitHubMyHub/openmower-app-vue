import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import './assets/styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from './plugins'

const app = createApp(App)
registerPlugins(app)
app.mount('#app')

/**
 * plugins/vuetify.ts
 *
 * Vuetify configuration. Theme palette mirrors the original MUI theme
 * defined in the upstream openmower-app project.
 *
 * Documentation: https://vuetifyjs.com
 */
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const sharedColors = {
  primary: '#4CAF50',
  'primary-darken-1': '#388E3C',
  'primary-lighten-1': '#81C784',
  secondary: '#FFC107',
  'secondary-darken-1': '#FFA000',
  'secondary-lighten-1': '#FFD54F',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
}

const light: ThemeDefinition = {
  dark: false,
  colors: {
    ...sharedColors,
    background: '#FAFAFA',
    surface: '#FFFFFF',
    'on-background': '#212121',
    'on-surface': '#212121',
  },
}

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    ...sharedColors,
    background: '#121212',
    surface: '#1E1E1E',
    'on-background': '#EDEDED',
    'on-surface': '#EDEDED',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: { light, dark },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-weight: 500;',
    },
    VCard: {
      rounded: 'lg',
    },
  },
})

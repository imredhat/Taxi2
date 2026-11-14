export default defineNuxtConfig({
  runtimeConfig: {
    paymentApiOrigin: 'http://127.0.0.1:3001',
    public: {
      weatherApiKey: process.env.NUXT_PUBLIC_WEATHER_API_KEY || ''
    }
  },
  modules: ['motion-v/nuxt'],
  experimental: {
    appManifest: false
  },
  app: {
    head: {
      title: 'پویش تاکسی',
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      meta: [
        { name: 'description', content: 'پویش تاکسی | آژانس اینترنتی' },
        { name: 'keywords', content: 'پویش تاکسی, آژانس اینترنتی' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/images/logo/favicon.png' }
      ]
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001/api',
        changeOrigin: true
      }
    }
  },
  devServer: {
    port: 3000,
    host: 'localhost'
  }
})

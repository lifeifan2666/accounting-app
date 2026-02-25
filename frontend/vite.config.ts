import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: '记账本',
        short_name: '记账本',
        description: '简单好用的个人记账应用',
        theme_color: '#F7F8FA',
        background_color: '#F7F8FA',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/add-96x96.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: '记一笔',
            short_name: '记账',
            description: '快速记录一笔支出或收入',
            url: '/add',
            icons: [{ src: '/icons/add-96x96.svg', sizes: '96x96', type: 'image/svg+xml' }]
          },
          {
            name: '查看明细',
            short_name: '明细',
            description: '查看交易记录',
            url: '/',
            icons: [{ src: '/icons/list-96x96.svg', sizes: '96x96', type: 'image/svg+xml' }]
          },
          {
            name: '统计图表',
            short_name: '图表',
            description: '查看收支统计',
            url: '/chart',
            icons: [{ src: '/icons/chart-96x96.svg', sizes: '96x96', type: 'image/svg+xml' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ],
})

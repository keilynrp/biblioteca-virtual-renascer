import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Biblioteca Virtual Renascer do Saber',
  description: 'Documentación completa del proyecto',
  base: '/bvs_framework/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guías', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/tu-usuario/bvs_framework' }
    ],

    sidebar: {
      '/guides/': [
        {
          text: 'Inicio Rápido',
          items: [
            { text: 'Introducción', link: '/guides/START_HERE' },
            { text: 'Instalación', link: '/guides/INICIO_RAPIDO' },
            { text: 'Quick Start Backend', link: '/guides/QUICK_START_BACKEND' }
          ]
        },
        {
          text: 'Setup',
          items: [
            { text: 'Docker Setup', link: '/setup/DOCKER_SETUP' },
            { text: 'Configuración WSL', link: '/setup/CONFIGURAR_DOCKER_WSL' },
            { text: 'SSL Setup', link: '/SSL_SETUP' }
          ]
        },
        {
          text: 'Uso',
          items: [
            { text: 'Autenticación', link: '/guides/COMO_HACER_LOGIN' },
            { text: 'Importar Libros', link: '/guides/EJECUTAR_IMPORTACION' },
            { text: 'Gestión de Usuario', link: '/guides/INSTRUCCIONES_CREAR_USUARIO' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Documentation',
          items: [
            { text: 'Visión General', link: '/api/' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Content', link: '/api/content' },
            { text: 'Subscriptions', link: '/api/subscriptions' },
            { text: 'Payments', link: '/api/payments' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Models', link: '/api/models' },
            { text: 'OpenAPI Schema', link: '/api/openapi-schema' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tu-usuario/bvs_framework' }
    ],

    footer: {
      message: 'Licencia MIT',
      copyright: 'Copyright © 2025 Renascer do Saber'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/tu-usuario/bvs_framework/edit/main/docs/:path',
      text: 'Editar esta página en GitHub'
    },

    lastUpdated: {
      text: 'Actualizado el',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})

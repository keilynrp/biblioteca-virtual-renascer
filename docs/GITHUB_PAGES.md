# 📖 Configuración de GitHub Pages

Guía para configurar y desplegar la documentación en GitHub Pages.

## 🚀 Setup Inicial

### 1. Instalar Dependencias

```bash
cd docs
npm install
```

### 2. Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### 3. Build

```bash
# Crear build de producción
npm run build

# Preview del build
npm run preview
```

## ⚙️ Configuración de GitHub

### 1. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: **GitHub Actions**
4. Save

### 2. Permisos del Workflow

El workflow `.github/workflows/deploy-docs.yml` ya está configurado con los permisos necesarios:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### 3. Variables de Entorno

Si tu repositorio no es `bvs_framework`, actualiza `base` en `docs/.vitepress/config.js`:

```javascript
export default defineConfig({
  base: '/tu-nombre-repo/',
  // ...
})
```

## 🔄 Deployment Automático

El deployment ocurre automáticamente cuando:

1. Haces push a `main`
2. Modificas archivos en `/docs`
3. Modificas `README.md`, `CONTRIBUTING.md` o `CHANGELOG.md`

También puedes deployar manualmente:

1. Ve a Actions en GitHub
2. Selecciona "Deploy Documentation"
3. Click en "Run workflow"

## 📁 Estructura de Archivos

```
docs/
├── .vitepress/
│   ├── config.js          # Configuración de VitePress
│   └── theme/             # Customización de tema (opcional)
├── guides/                # Guías de usuario
├── api/                   # Documentación de API
├── setup/                 # Guías de setup
├── package.json           # Dependencias
└── index.md               # Homepage
```

## 🎨 Personalización

### Tema

Edita `docs/.vitepress/config.js`:

```javascript
export default defineConfig({
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: {...},
    // ...
  }
})
```

### Homepage

Edita `docs/index.md`:

```yaml
---
layout: home
hero:
  name: "Tu Título"
  tagline: "Tu subtítulo"
features:
  - title: Feature 1
    details: Descripción
---
```

## 🔗 URLs

Una vez deployado, tu documentación estará disponible en:

```
https://tu-usuario.github.io/bvs_framework/
```

Páginas específicas:

- Homepage: `https://tu-usuario.github.io/bvs_framework/`
- Guías: `https://tu-usuario.github.io/bvs_framework/guides/`
- API: `https://tu-usuario.github.io/bvs_framework/api/`

## 📝 Agregar Nueva Página

1. Crea archivo Markdown en la carpeta apropiada:

```bash
# Ejemplo: Nueva guía
touch docs/guides/mi-nueva-guia.md
```

2. Agrega contenido:

```markdown
# Mi Nueva Guía

Contenido de la guía...
```

3. Agrega al sidebar en `config.js`:

```javascript
sidebar: {
  '/guides/': [
    {
      text: 'Guías',
      items: [
        // ...
        { text: 'Mi Nueva Guía', link: '/guides/mi-nueva-guia' }
      ]
    }
  ]
}
```

4. Commit y push:

```bash
git add docs/
git commit -m "docs: add new guide"
git push origin main
```

## 🔍 SEO

VitePress incluye SEO automáticamente. Para mejorar:

```markdown
---
title: Título de la Página
description: Descripción para motores de búsqueda
head:
  - - meta
    - name: keywords
      content: biblioteca, virtual, docs
---
```

## 🚨 Troubleshooting

### Build Falla

1. Verifica que `package.json` esté en `/docs`
2. Verifica que dependencies estén instaladas
3. Revisa logs del workflow en GitHub Actions

### 404 en Páginas

1. Verifica que `base` en `config.js` coincida con nombre del repo
2. Verifica que los links en sidebar sean correctos (sin `.md`)

### Estilos no Cargan

1. Verifica que `base` esté configurado correctamente
2. Haz hard refresh (Ctrl+Shift+R)

## 📊 Analytics (Opcional)

Agregar Google Analytics:

```javascript
// docs/.vitepress/config.js
export default defineConfig({
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');`
    ]
  ]
})
```

## 🔒 Restricciones

Si quieres docs privadas:

1. Settings → Pages → Source: Deploy from a branch
2. Selecciona branch privado
3. O usa GitHub Enterprise para docs privadas

## 📚 Recursos

- [VitePress Docs](https://vitepress.dev/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>

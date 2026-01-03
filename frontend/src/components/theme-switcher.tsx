"use client"

import { useState, useEffect } from 'react'
import { Palette, Moon, Sun, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Theme {
  name: string
  class: string
  color: string
  description: string
}

const themes: Theme[] = [
  {
    name: 'Teal',
    class: '',
    color: 'hsl(192, 100%, 22%)',
    description: 'Tema predeterminado azul verdoso'
  },
  {
    name: 'Ocean Blue',
    class: 'theme-ocean',
    color: 'hsl(210, 100%, 35%)',
    description: 'Azul profundo del océano'
  },
  {
    name: 'Forest Green',
    class: 'theme-forest',
    color: 'hsl(142, 76%, 36%)',
    description: 'Verde natural del bosque'
  },
  {
    name: 'Royal Purple',
    class: 'theme-purple',
    color: 'hsl(280, 65%, 50%)',
    description: 'Púrpura elegante y real'
  },
  {
    name: 'Sunset Orange',
    class: 'theme-sunset',
    color: 'hsl(25, 95%, 53%)',
    description: 'Naranja cálido del atardecer'
  },
  {
    name: 'Rose Red',
    class: 'theme-rose',
    color: 'hsl(340, 75%, 55%)',
    description: 'Rojo rosado vibrante'
  }
]

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Marca el componente como montado (previene errores de hidratación)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load saved preferences on mount (solo en el cliente)
  useEffect(() => {
    if (!isMounted) return

    const savedTheme = localStorage.getItem('app-theme') || ''
    const savedDarkMode = localStorage.getItem('app-dark-mode') === 'true'

    setCurrentTheme(savedTheme)
    setDarkMode(savedDarkMode)

    // Apply saved preferences
    applyTheme(savedTheme, false)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [isMounted])

  const applyTheme = (themeClass: string, save = true) => {
    // Remove all theme classes
    themes.forEach(t => {
      if (t.class) {
        document.body.classList.remove(t.class)
      }
    })

    // Apply new theme
    if (themeClass) {
      document.body.classList.add(themeClass)
    }

    setCurrentTheme(themeClass)

    // Save to localStorage
    if (save) {
      localStorage.setItem('app-theme', themeClass)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('app-dark-mode', String(newDarkMode))
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="relative overflow-hidden"
      >
        <Palette className="h-5 w-5" />
      </Button>

      {/* Theme Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <Card className="absolute right-0 top-12 z-50 w-96 card-frosted shadow-elevated-xl
                          animate-scaleIn border-2 border-[hsl(var(--border-strong))]">
            <CardHeader className="gradient-primary text-white relative overflow-hidden">
              {/* Decorative blur circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />

              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm
                               flex items-center justify-center border border-white/30">
                  <Palette className="h-5 w-5" />
                </div>
                <span className="text-xl">Personalizar Tema</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Dark Mode Toggle */}
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {darkMode ? (
                      <Moon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    ) : (
                      <Sun className="h-5 w-5 text-[hsl(var(--warning))]" />
                    )}
                    <span className="font-semibold">
                      {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={toggleDarkMode}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                      darkMode
                        ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-dark))]'
                        : 'bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md
                                 transform transition-transform duration-300 ${
                        darkMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {darkMode
                    ? 'Interfaz oscura para reducir la fatiga visual'
                    : 'Interfaz clara con alto contraste'}
                </p>
              </div>

              {/* Theme Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-[hsl(var(--primary))]" />
                  <h4 className="font-semibold text-sm">Selecciona un tema</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => {
                    const isActive = currentTheme === theme.class

                    return (
                      <button
                        key={theme.name}
                        onClick={() => applyTheme(theme.class)}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-300
                                   hover:shadow-elevated-md ${
                          isActive
                            ? 'border-[hsl(var(--primary))] shadow-primary bg-[hsl(var(--primary-soft))]'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))]'
                        }`}
                      >
                        {/* Color Circle */}
                        <div className="relative mb-3">
                          <div
                            className="w-16 h-16 rounded-full mx-auto shadow-elevated-md
                                       group-hover:scale-110 transition-transform duration-300"
                            style={{ background: theme.color }}
                          />

                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white rounded-full p-1.5 shadow-lg">
                                <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Theme Name */}
                        <div className="text-sm font-semibold text-center mb-1">
                          {theme.name}
                        </div>

                        {/* Theme Description */}
                        <div className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                          {theme.description}
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br
                                       from-[hsl(var(--primary)/0.1)] to-transparent
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                       pointer-events-none" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preview Section */}
              <div className="glass p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-[hsl(var(--primary))]" />
                  <h4 className="font-semibold text-sm">Vista Previa</h4>
                </div>

                {/* Sample Elements */}
                <div className="space-y-2">
                  <Button className="w-full gradient-primary text-white">
                    Botón Primario
                  </Button>

                  <div className="flex gap-2">
                    <div className="flex-1 gradient-success h-8 rounded flex items-center justify-center text-white text-xs font-medium">
                      Éxito
                    </div>
                    <div className="flex-1 gradient-warning h-8 rounded flex items-center justify-center text-white text-xs font-medium">
                      Alerta
                    </div>
                    <div className="flex-1 gradient-danger h-8 rounded flex items-center justify-center text-white text-xs font-medium">
                      Error
                    </div>
                  </div>

                  <div className="text-gradient-primary text-center font-bold text-lg">
                    Texto con Gradiente
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-[hsl(var(--muted-foreground))] text-center p-3
                            bg-[hsl(var(--muted))] rounded-lg">
                <p>Los cambios se guardan automáticamente y se aplicarán en toda la aplicación</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

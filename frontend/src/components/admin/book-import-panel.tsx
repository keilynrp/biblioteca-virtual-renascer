"use client"

import { useState, useEffect } from "react"
import api, { handleApiError, showSuccess } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Search, Tags, CheckCircle2, XCircle, AlertCircle, BookOpen, Database, Zap, TrendingUp } from "lucide-react"

interface ImportResult {
    success: boolean
    imported: number
    skipped: number
    errors: number
    indexed: number
    total_books_in_db: number
    imported_titles: string[]
    error_details: any[]
}

interface ImportProgress {
    stage: 'fetching' | 'processing' | 'indexing' | 'complete'
    progress: number
    message: string
}

// Animated stat card component
function AnimatedStatCard({
    value,
    label,
    icon: Icon,
    color,
    delay = 0
}: {
    value: number
    label: string
    icon: any
    color: string
    delay?: number
}) {
    const [displayValue, setDisplayValue] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay)
        return () => clearTimeout(timer)
    }, [delay])

    useEffect(() => {
        if (!isVisible) return

        const duration = 1500
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value, isVisible])

    const colorClasses = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    }

    return (
        <div className={`
            relative overflow-hidden rounded-xl p-6 border-2
            ${colorClasses[color as keyof typeof colorClasses]}
            transform transition-all duration-500
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            hover:scale-105 hover:shadow-lg
        `}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={`
                        h-12 w-12 rounded-xl flex items-center justify-center
                        bg-gradient-to-br ${color === 'emerald' ? 'from-emerald-500 to-emerald-600' : ''}
                        ${color === 'amber' ? 'from-amber-500 to-amber-600' : ''}
                        ${color === 'red' ? 'from-red-500 to-red-600' : ''}
                        ${color === 'blue' ? 'from-blue-500 to-blue-600' : ''}
                        ${color === 'purple' ? 'from-purple-500 to-purple-600' : ''}
                        shadow-lg
                    `}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
                <div className="text-4xl font-bold mb-1">
                    {displayValue.toLocaleString()}
                </div>
                <div className="text-sm font-medium opacity-80">{label}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
        </div>
    )
}

export function BookImportPanel() {
    const [loading, setLoading] = useState(false)
    const [importMode, setImportMode] = useState<'subjects' | 'query'>('subjects')
    const [result, setResult] = useState<ImportResult | null>(null)
    const [progress, setProgress] = useState<ImportProgress | null>(null)

    // Subjects mode
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
    const [customSubject, setCustomSubject] = useState('')

    // Query mode
    const [searchQuery, setSearchQuery] = useState('')

    // Common
    const [limit, setLimit] = useState(100)

    const predefinedSubjects = [
        'programming', 'python', 'javascript', 'web_development',
        'science', 'physics', 'chemistry', 'biology',
        'fiction', 'fantasy', 'science_fiction', 'mystery',
        'history', 'philosophy', 'mathematics', 'art',
        'psychology', 'business', 'health', 'technology'
    ]

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        )
    }

    const addCustomSubject = () => {
        if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
            setSelectedSubjects(prev => [...prev, customSubject.trim()])
            setCustomSubject('')
        }
    }

    const removeSubject = (subject: string) => {
        setSelectedSubjects(prev => prev.filter(s => s !== subject))
    }

    const handleImport = async () => {
        if (importMode === 'subjects' && selectedSubjects.length === 0) {
            handleApiError({ message: 'Selecciona al menos un tema' } as any)
            return
        }

        if (importMode === 'query' && !searchQuery.trim()) {
            handleApiError({ message: 'Introduce un término de búsqueda' } as any)
            return
        }

        try {
            setLoading(true)
            setResult(null)

            // Simulate progress stages
            setProgress({ stage: 'fetching', progress: 0, message: 'Conectando con OpenLibrary...' })

            setTimeout(() => {
                setProgress({ stage: 'fetching', progress: 30, message: 'Descargando metadatos...' })
            }, 500)

            setTimeout(() => {
                setProgress({ stage: 'processing', progress: 60, message: 'Procesando libros...' })
            }, 1500)

            const payload: any = {
                limit,
                auto_index: true  // Always auto-index with Meilisearch
            }

            if (importMode === 'subjects') {
                payload.subjects = selectedSubjects
            } else {
                payload.query = searchQuery
            }

            const response = await api.post('/content/admin/import-books/', payload)

            setProgress({ stage: 'indexing', progress: 90, message: 'Indexando en base de datos...' })

            setTimeout(() => {
                setProgress({ stage: 'complete', progress: 100, message: '¡Importación completa!' })
                setResult(response.data)

                if (response.data.success) {
                    showSuccess(
                        `Importados ${response.data.imported} libros correctamente`,
                        '¡Importación Exitosa!'
                    )
                }
            }, 500)

        } catch (error) {
            handleApiError(error)
            setProgress(null)
        } finally {
            setTimeout(() => {
                setLoading(false)
                setProgress(null)
            }, 2000)
        }
    }

    return (
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
            {/* Enhanced Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-primary p-6">
                <div className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-white text-2xl mb-2">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Download className="h-6 w-6" />
                        </div>
                        Importar Libros desde OpenLibrary
                    </CardTitle>
                    <CardDescription className="text-white/90 text-base ml-15">
                        Importa libros desde la API pública de OpenLibrary.org con sus portadas y metadatos completos
                    </CardDescription>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-dark/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <CardContent className="space-y-6 pt-6">
                <Tabs value={importMode} onValueChange={(v) => setImportMode(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="subjects" className="flex items-center gap-2">
                            <Tags className="h-4 w-4" />
                            Por Temas
                        </TabsTrigger>
                        <TabsTrigger value="query" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Por Búsqueda
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="subjects" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Tags className="h-4 w-4 text-primary" />
                                Temas Predefinidos
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {predefinedSubjects.map((subject, index) => (
                                    <Badge
                                        key={subject}
                                        variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                                        className={`
                                            cursor-pointer transition-all duration-300
                                            ${selectedSubjects.includes(subject)
                                                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/30 scale-105'
                                                : 'hover:bg-primary/10 hover:border-primary/50 hover:scale-105'
                                            }
                                        `}
                                        onClick={() => toggleSubject(subject)}
                                        style={{
                                            animation: `fadeInUp 0.3s ease-out ${index * 0.02}s both`
                                        }}
                                    >
                                        {selectedSubjects.includes(subject) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {subject.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-border">
                            <Label className="text-sm font-semibold">Tema Personalizado</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="ej: machine_learning, nodejs, etc."
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
                                    className="bg-background"
                                />
                                <Button
                                    onClick={addCustomSubject}
                                    variant="secondary"
                                    className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30"
                                >
                                    <Tags className="h-4 w-4 mr-2" />
                                    Agregar
                                </Button>
                            </div>
                        </div>

                        {selectedSubjects.length > 0 && (
                            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    Temas Seleccionados ({selectedSubjects.length})
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSubjects.map((subject, index) => (
                                        <Badge
                                            key={subject}
                                            variant="secondary"
                                            className="cursor-pointer bg-gradient-to-r from-primary to-primary-dark text-white hover:scale-110 transition-all duration-300 shadow-md shadow-primary/30"
                                            onClick={() => removeSubject(subject)}
                                            style={{
                                                animation: `scaleIn 0.3s ease-out ${index * 0.05}s both`
                                            }}
                                        >
                                            {subject.replace(/_/g, ' ')}
                                            <XCircle className="h-3 w-3 ml-1.5" />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="query" className="space-y-4 mt-4">
                        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Término de Búsqueda
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="ej: python programming, Gabriel García Márquez, etc."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10">
                                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    Puedes buscar por título, autor, tema o cualquier término relacionado. La búsqueda es flexible y encontrará libros relevantes.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Configuración */}
                <div className="space-y-4 p-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-muted/30 to-transparent backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                            <Database className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">Configuración de Importación</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Número de Libros
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="bg-background text-lg font-semibold pr-20"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                    máx: 500
                                </div>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                                    style={{ width: `${(limit / 500) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                Indexación Automática
                            </Label>
                            <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-medium text-foreground">
                                        Indexación en Meilisearch activada
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        Los libros se indexarán automáticamente y estarán disponibles para búsqueda inmediatamente
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                {loading && progress && (
                    <div className="space-y-4 p-6 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent animate-fadeInUp">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                {progress.stage === 'fetching' && <Download className="h-5 w-5 text-primary animate-pulse" />}
                                {progress.stage === 'processing' && <Zap className="h-5 w-5 text-primary animate-pulse" />}
                                {progress.stage === 'indexing' && <Database className="h-5 w-5 text-primary animate-pulse" />}
                                {progress.stage === 'complete' && <CheckCircle2 className="h-5 w-5 text-success animate-pulse" />}
                                <span className="font-semibold text-lg">{progress.message}</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">{progress.progress}%</span>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-light to-primary rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress.progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>

                        {/* Stage indicators */}
                        <div className="flex justify-between items-center pt-2">
                            {[
                                { key: 'fetching', icon: Download, label: 'Descarga' },
                                { key: 'processing', icon: Zap, label: 'Proceso' },
                                { key: 'indexing', icon: Database, label: 'Indexado' },
                                { key: 'complete', icon: CheckCircle2, label: 'Completo' },
                            ].map((stage, index) => {
                                const isActive = progress.stage === stage.key
                                const isPast = ['fetching', 'processing', 'indexing', 'complete'].indexOf(progress.stage) > index
                                const StageIcon = stage.icon

                                return (
                                    <div key={stage.key} className="flex flex-col items-center gap-2">
                                        <div className={`
                                            h-10 w-10 rounded-full flex items-center justify-center
                                            transition-all duration-300
                                            ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/50' : ''}
                                            ${isPast ? 'bg-success text-white' : ''}
                                            ${!isActive && !isPast ? 'bg-muted text-muted-foreground' : ''}
                                        `}>
                                            <StageIcon className="h-5 w-5" />
                                        </div>
                                        <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {stage.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Botón de Importar */}
                <Button
                    onClick={handleImport}
                    disabled={loading || (importMode === 'subjects' && selectedSubjects.length === 0)}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all"
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importando...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Iniciar Importación
                        </>
                    )}
                </Button>

                {/* Resultados */}
                {result && (
                    <div className="space-y-6 animate-fadeInUp">
                        {/* Header with success animation */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-success/10 via-success/5 to-transparent border border-success/30">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center animate-scaleIn shadow-lg shadow-success/30">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground">¡Importación Completada!</h3>
                                <p className="text-sm text-muted-foreground">Resultados de la operación</p>
                            </div>
                        </div>

                        {/* Animated Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <AnimatedStatCard
                                value={result.imported}
                                label="Importados"
                                icon={CheckCircle2}
                                color="emerald"
                                delay={0}
                            />
                            <AnimatedStatCard
                                value={result.skipped}
                                label="Omitidos"
                                icon={AlertCircle}
                                color="amber"
                                delay={100}
                            />
                            <AnimatedStatCard
                                value={result.errors}
                                label="Errores"
                                icon={XCircle}
                                color="red"
                                delay={200}
                            />
                            <AnimatedStatCard
                                value={result.indexed}
                                label="Indexados"
                                icon={Database}
                                color="blue"
                                delay={300}
                            />
                        </div>

                        {/* Total Database Stats with Chart */}
                        <div className="relative overflow-hidden p-6 rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Total en Base de Datos</div>
                                            <div className="text-3xl font-bold text-foreground">{result.total_books_in_db.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                                        <div className="text-2xl font-bold text-success">
                                            {result.imported > 0 ? Math.round((result.imported / (result.imported + result.errors + result.skipped)) * 100) : 0}%
                                        </div>
                                    </div>
                                </div>

                                {/* Visual bar chart */}
                                <div className="space-y-2">
                                    {result.imported > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium w-20 text-emerald-600 dark:text-emerald-400">Importados</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(result.imported / Math.max(result.imported, result.skipped, result.errors)) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold w-12 text-right">{result.imported}</span>
                                        </div>
                                    )}
                                    {result.skipped > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium w-20 text-amber-600 dark:text-amber-400">Omitidos</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(result.skipped / Math.max(result.imported, result.skipped, result.errors)) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold w-12 text-right">{result.skipped}</span>
                                        </div>
                                    )}
                                    {result.errors > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium w-20 text-red-600 dark:text-red-400">Errores</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(result.errors / Math.max(result.imported, result.skipped, result.errors)) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold w-12 text-right">{result.errors}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                        </div>

                        {/* Imported Books List */}
                        {result.imported_titles.length > 0 && (
                            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <h4 className="font-semibold text-foreground">Libros Importados Recientemente</h4>
                                    <Badge variant="secondary" className="ml-auto">
                                        {result.imported_titles.length} de {result.imported}
                                    </Badge>
                                </div>
                                <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                                    {result.imported_titles.map((title, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 border border-transparent hover:border-primary/30"
                                            style={{
                                                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                                            }}
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <BookOpen className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{title}</p>
                                                <p className="text-xs text-muted-foreground">Libro #{index + 1}</p>
                                            </div>
                                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error Details */}
                        {result.error_details.length > 0 && (
                            <div className="p-6 rounded-xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-lg shadow-destructive/30">
                                        <AlertCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Detalles de Errores</h4>
                                        <p className="text-xs text-muted-foreground">{result.error_details.length} error(es) encontrado(s)</p>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {result.error_details.map((error, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                                            style={{
                                                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                                            }}
                                        >
                                            <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-destructive flex-1">{error.reason || 'Error desconocido'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

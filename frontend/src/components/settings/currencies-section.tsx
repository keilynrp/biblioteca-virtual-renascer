"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import { Plus, RefreshCw, Loader2, DollarSign, Pencil, Star } from 'lucide-react'
import api from '@/lib/api'
import { userToast } from '@/lib/toast-utils'
import { useCurrency } from '@/context/currency-context'

type Currency = {
    id: string
    code: string
    name: string
    symbol: string
    is_active: boolean
    is_base: boolean
}

type ExchangeRate = {
    id: string
    from_code: string
    to_code: string
    rate: string
    is_manual: boolean
    last_updated: string
}

interface CurrenciesSectionProps {
    isAdmin: boolean
}

export function CurrenciesSection({ isAdmin }: CurrenciesSectionProps) {
    const { toast } = useToast()
    const { refresh } = useCurrency()
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [rates, setRates] = useState<ExchangeRate[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    // Add currency dialog
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '', is_base: false })
    const [saving, setSaving] = useState(false)

    // Edit rate dialog
    const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null)
    const [editRate, setEditRate] = useState('')
    const [editIsManual, setEditIsManual] = useState(false)
    const [savingRate, setSavingRate] = useState(false)

    useEffect(() => {
        if (isAdmin) {
            fetchAll()
        }
    }, [isAdmin])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [currRes, ratesRes] = await Promise.all([
                api.get('/currencies/currencies/'),
                api.get('/currencies/rates/'),
            ])
            setCurrencies(Array.isArray(currRes.data) ? currRes.data : (currRes.data.results ?? []))
            setRates(Array.isArray(ratesRes.data) ? ratesRes.data : (ratesRes.data.results ?? []))
        } catch {
            toast({ title: 'Error', description: 'No se pudieron cargar los datos de monedas', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleSetAsDefault = async (currency: Currency) => {
        try {
            await api.patch(`/currencies/currencies/${currency.id}/`, { is_base: true })
            setCurrencies(prev => prev.map(c => ({ ...c, is_base: c.id === currency.id })))
            refresh()
            toast({
                title: 'Moneda predeterminada actualizada',
                description: `${currency.code} es ahora la moneda predeterminada del sistema.`,
            })
        } catch {
            toast({ title: 'Error', description: 'No se pudo actualizar la moneda predeterminada', variant: 'destructive' })
        }
    }

    const handleToggleActive = async (currency: Currency) => {
        try {
            await api.patch(`/currencies/currencies/${currency.id}/`, { is_active: !currency.is_active })
            setCurrencies(prev => prev.map(c => c.id === currency.id ? { ...c, is_active: !c.is_active } : c))
            toast({
                title: currency.is_active ? 'Moneda desactivada' : 'Moneda activada',
                description: `${currency.code} ha sido ${currency.is_active ? 'desactivada' : 'activada'}.`,
            })
        } catch {
            toast({ title: 'Error', description: 'No se pudo actualizar la moneda', variant: 'destructive' })
        }
    }

    const handleAddCurrency = async () => {
        if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
            toast({ title: 'Campos requeridos', description: 'Completa todos los campos', variant: 'destructive' })
            return
        }
        setSaving(true)
        try {
            await api.post('/currencies/currencies/', {
                ...newCurrency,
                code: newCurrency.code.toUpperCase(),
            })
            toast({ title: 'Moneda creada', description: `${newCurrency.code.toUpperCase()} añadida correctamente.` })
            setShowAddDialog(false)
            setNewCurrency({ code: '', name: '', symbol: '', is_base: false })
            await fetchAll()
        } catch {
            toast({ title: 'Error', description: 'No se pudo crear la moneda', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const handleSyncRates = async () => {
        setSyncing(true)
        try {
            await api.post('/currencies/currencies/sync_rates/')
            toast({ title: 'Tasas sincronizadas', description: 'Las tasas de cambio han sido actualizadas con Frankfurter.' })
            const ratesRes = await api.get('/currencies/rates/')
            setRates(Array.isArray(ratesRes.data) ? ratesRes.data : (ratesRes.data.results ?? []))
        } catch {
            toast({ title: 'Error', description: 'No se pudo sincronizar las tasas', variant: 'destructive' })
        } finally {
            setSyncing(false)
        }
    }

    const handleOpenEditRate = (rate: ExchangeRate) => {
        setEditingRate(rate)
        setEditRate(rate.rate)
        setEditIsManual(rate.is_manual)
    }

    const handleSaveRate = async () => {
        if (!editingRate) return
        setSavingRate(true)
        try {
            await api.patch(`/currencies/rates/${editingRate.id}/`, { rate: editRate, is_manual: editIsManual })
            setRates(prev => prev.map(r => r.id === editingRate.id ? { ...r, rate: editRate, is_manual: editIsManual } : r))
            toast({ title: 'Tasa actualizada', description: `Tasa ${editingRate.from_code}→${editingRate.to_code} guardada.` })
            setEditingRate(null)
        } catch {
            toast({ title: 'Error', description: 'No se pudo guardar la tasa', variant: 'destructive' })
        } finally {
            setSavingRate(false)
        }
    }

    if (!isAdmin) return null

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const currencyColumns = [
        { header: 'Código', accessorKey: 'code' as keyof Currency },
        { header: 'Nombre', accessorKey: 'name' as keyof Currency },
        { header: 'Símbolo', accessorKey: 'symbol' as keyof Currency },
        {
            header: 'Base',
            cell: (c: Currency) => c.is_base
                ? <Badge className="bg-green-600 text-white hover:bg-green-700">Base</Badge>
                : null,
        },
        {
            header: 'Estado',
            cell: (c: Currency) => (
                <Badge variant={c.is_active ? 'default' : 'secondary'}>
                    {c.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
            ),
        },
        {
            header: 'Acciones',
            cell: (c: Currency) => {
                if (c.is_base) return null
                return (
                    <div className="flex items-center gap-2">
                        {c.is_active && (
                            <Button variant="outline" size="sm" onClick={() => handleSetAsDefault(c)}>
                                <Star className="h-3 w-3 mr-1" />
                                Predeterminada
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleToggleActive(c)}>
                            {c.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                    </div>
                )
            },
        },
    ]

    const rateColumns = [
        { header: 'De', accessorKey: 'from_code' as keyof ExchangeRate },
        { header: 'A', accessorKey: 'to_code' as keyof ExchangeRate },
        { header: 'Tasa', accessorKey: 'rate' as keyof ExchangeRate },
        {
            header: 'Tipo',
            cell: (r: ExchangeRate) => (
                <Badge variant={r.is_manual ? 'default' : 'secondary'}>
                    {r.is_manual ? 'Manual' : 'Automática'}
                </Badge>
            ),
        },
        {
            header: 'Última actualización',
            cell: (r: ExchangeRate) => new Date(r.last_updated).toLocaleString('es'),
        },
        {
            header: 'Acciones',
            cell: (r: ExchangeRate) => (
                <Button variant="outline" size="sm" onClick={() => handleOpenEditRate(r)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                </Button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Monedas y Tasas de Cambio</h2>
            </div>

            <Tabs defaultValue="currencies">
                <TabsList>
                    <TabsTrigger value="currencies">Monedas</TabsTrigger>
                    <TabsTrigger value="rates">Tasas de Cambio</TabsTrigger>
                </TabsList>

                {/* Tab Monedas */}
                <TabsContent value="currencies" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Monedas</CardTitle>
                                    <CardDescription>Gestiona las monedas disponibles en el sistema</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setShowAddDialog(true)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Añadir Moneda
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={currencies}
                                columns={currencyColumns}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Tasas */}
                <TabsContent value="rates" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Tasas de Cambio</CardTitle>
                                    <CardDescription>Tasas actuales respecto a la moneda base</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleSyncRates} disabled={syncing}>
                                    {syncing
                                        ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        : <RefreshCw className="h-4 w-4 mr-1" />
                                    }
                                    Sincronizar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={rates}
                                columns={rateColumns}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog Añadir Moneda */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Moneda</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="currency-code">Código (3 caracteres)</Label>
                            <Input
                                id="currency-code"
                                placeholder="USD"
                                maxLength={3}
                                value={newCurrency.code}
                                onChange={e => setNewCurrency(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency-name">Nombre</Label>
                            <Input
                                id="currency-name"
                                placeholder="US Dollar"
                                value={newCurrency.name}
                                onChange={e => setNewCurrency(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency-symbol">Símbolo</Label>
                            <Input
                                id="currency-symbol"
                                placeholder="$"
                                value={newCurrency.symbol}
                                onChange={e => setNewCurrency(prev => ({ ...prev, symbol: e.target.value }))}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Moneda base</Label>
                                <p className="text-sm text-muted-foreground">Marcar como moneda base del sistema</p>
                            </div>
                            <Button
                                variant={newCurrency.is_base ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setNewCurrency(prev => ({ ...prev, is_base: !prev.is_base }))}
                            >
                                {newCurrency.is_base ? 'Sí' : 'No'}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAddCurrency} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Editar Tasa */}
            <Dialog open={!!editingRate} onOpenChange={open => { if (!open) setEditingRate(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Editar Tasa: {editingRate?.from_code} → {editingRate?.to_code}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="rate-value">Tasa de cambio</Label>
                            <Input
                                id="rate-value"
                                type="number"
                                step="0.000001"
                                min="0"
                                value={editRate}
                                onChange={e => setEditRate(e.target.value)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Tasa manual</Label>
                                <p className="text-sm text-muted-foreground">
                                    Si está manual, no se sobreescribe al sincronizar
                                </p>
                            </div>
                            <Button
                                variant={editIsManual ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setEditIsManual(!editIsManual)}
                            >
                                {editIsManual ? 'Manual' : 'Automática'}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingRate(null)} disabled={savingRate}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveRate} disabled={savingRate}>
                            {savingRate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

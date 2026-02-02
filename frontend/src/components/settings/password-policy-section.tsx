"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Shield,
    Key,
    Users,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Lock
} from 'lucide-react'
import { passwordPolicyApi, PasswordPolicy, UserPasswordStatus } from '@/lib/api/password-policy'
import { useToast } from '@/hooks/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PasswordPolicySectionProps {
    isAdmin: boolean
}

export function PasswordPolicySection({ isAdmin }: PasswordPolicySectionProps) {
    const { toast } = useToast()
    const [policy, setPolicy] = useState<PasswordPolicy | null>(null)
    const [usersStatus, setUsersStatus] = useState<UserPasswordStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [resetting, setResetting] = useState(false)

    // Form state
    const [isEnabled, setIsEnabled] = useState(false)
    const [expirationDays, setExpirationDays] = useState('90')
    const [minLength, setMinLength] = useState(8)
    const [requireUppercase, setRequireUppercase] = useState(true)
    const [requireLowercase, setRequireLowercase] = useState(true)
    const [requireNumbers, setRequireNumbers] = useState(true)
    const [requireSpecial, setRequireSpecial] = useState(false)

    useEffect(() => {
        if (isAdmin) {
            loadPolicy()
            loadUsersStatus()
        }
    }, [isAdmin])

    const loadPolicy = async () => {
        try {
            const data = await passwordPolicyApi.getPolicy()
            setPolicy(data)
            setIsEnabled(data.is_enabled)
            setExpirationDays(data.expiration_days.toString())
            setMinLength(data.min_length)
            setRequireUppercase(data.require_uppercase)
            setRequireLowercase(data.require_lowercase)
            setRequireNumbers(data.require_numbers)
            setRequireSpecial(data.require_special)
        } catch {
            toast({
                title: 'Error',
                description: 'No se pudo cargar la política de contraseñas',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const loadUsersStatus = async () => {
        try {
            const data = await passwordPolicyApi.getUsersPasswordStatus(true)
            setUsersStatus(data.users)
        } catch {
            // Silent fail for users status
        }
    }

    const handleSavePolicy = async () => {
        setSaving(true)
        try {
            const updated = await passwordPolicyApi.updatePolicy({
                is_enabled: isEnabled,
                expiration_days: parseInt(expirationDays),
                min_length: minLength,
                require_uppercase: requireUppercase,
                require_lowercase: requireLowercase,
                require_numbers: requireNumbers,
                require_special: requireSpecial
            })
            setPolicy(updated)
            toast({
                title: 'Política actualizada',
                description: 'Los cambios se han guardado correctamente.',
            })
            loadUsersStatus()
        } catch {
            toast({
                title: 'Error',
                description: 'No se pudo guardar la política',
                variant: 'destructive'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleForceResetAll = async () => {
        setResetting(true)
        try {
            const result = await passwordPolicyApi.forcePasswordReset({ reset_all: true })
            toast({
                title: 'Reset forzado',
                description: result.message,
            })
            loadUsersStatus()
        } catch {
            toast({
                title: 'Error',
                description: 'No se pudo forzar el reset de contraseñas',
                variant: 'destructive'
            })
        } finally {
            setResetting(false)
        }
    }

    if (!isAdmin) {
        return null
    }

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

    const expiredUsersCount = usersStatus.filter(u => u.password_expired).length

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Políticas de Contraseña</h2>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                    {isEnabled ? 'Activa' : 'Inactiva'}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Policy Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Configuración
                        </CardTitle>
                        <CardDescription>
                            Configure la política de expiración y complejidad de contraseñas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Enable/Disable */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Política de expiración</Label>
                                <p className="text-sm text-muted-foreground">
                                    Forzar cambio de contraseña periódico
                                </p>
                            </div>
                            <Button
                                variant={isEnabled ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsEnabled(!isEnabled)}
                            >
                                {isEnabled ? 'Habilitada' : 'Deshabilitada'}
                            </Button>
                        </div>

                        <Separator />

                        {/* Expiration Days */}
                        <div className="space-y-2">
                            <Label>Días de expiración</Label>
                            <Select value={expirationDays} onValueChange={setExpirationDays}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar días" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 días</SelectItem>
                                    <SelectItem value="60">60 días</SelectItem>
                                    <SelectItem value="90">90 días</SelectItem>
                                    <SelectItem value="180">180 días</SelectItem>
                                    <SelectItem value="365">365 días</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Password Requirements */}
                        <div className="space-y-4">
                            <Label className="text-base">Requisitos de contraseña</Label>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Longitud mínima</span>
                                    <Input
                                        type="number"
                                        value={minLength}
                                        onChange={(e) => setMinLength(parseInt(e.target.value) || 8)}
                                        className="w-20"
                                        min={6}
                                        max={32}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Requiere mayúsculas</span>
                                    <Button
                                        variant={requireUppercase ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRequireUppercase(!requireUppercase)}
                                    >
                                        {requireUppercase ? 'Sí' : 'No'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Requiere minúsculas</span>
                                    <Button
                                        variant={requireLowercase ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRequireLowercase(!requireLowercase)}
                                    >
                                        {requireLowercase ? 'Sí' : 'No'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Requiere números</span>
                                    <Button
                                        variant={requireNumbers ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRequireNumbers(!requireNumbers)}
                                    >
                                        {requireNumbers ? 'Sí' : 'No'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Requiere caracteres especiales</span>
                                    <Button
                                        variant={requireSpecial ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRequireSpecial(!requireSpecial)}
                                    >
                                        {requireSpecial ? 'Sí' : 'No'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <Button
                            onClick={handleSavePolicy}
                            disabled={saving}
                            className="w-full"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </CardContent>
                </Card>

                {/* Users Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Estado de Usuarios
                        </CardTitle>
                        <CardDescription>
                            Usuarios con contraseñas expiradas o pendientes de cambio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Summary */}
                        <div className="flex items-center gap-4">
                            <div className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg
                                ${expiredUsersCount > 0
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }
                            `}>
                                {expiredUsersCount > 0 ? (
                                    <AlertTriangle className="h-4 w-4" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                <span className="font-medium">
                                    {expiredUsersCount} usuario{expiredUsersCount !== 1 ? 's' : ''} con contraseña expirada
                                </span>
                            </div>
                        </div>

                        {/* Users List */}
                        {expiredUsersCount > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {usersStatus.filter(u => u.password_expired).map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                    >
                                        <div>
                                            <span className="font-medium">{user.username}</span>
                                            <span className="text-sm text-muted-foreground ml-2">
                                                {user.email}
                                            </span>
                                        </div>
                                        {user.force_password_change && (
                                            <Badge variant="outline" className="text-amber-600">
                                                Forzado
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <Separator />

                        {/* Force Reset Button */}
                        <Alert>
                            <Lock className="h-4 w-4" />
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <span>Forzar cambio de contraseña a todos los usuarios (excepto administradores)</span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={resetting}>
                                                {resetting ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                )}
                                                Forzar Reset
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Forzar cambio de contraseña?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción obligará a todos los usuarios (excepto administradores)
                                                    a cambiar su contraseña en el próximo inicio de sesión.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleForceResetAll}>
                                                    Confirmar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </AlertDescription>
                        </Alert>

                        <p className="text-xs text-muted-foreground">
                            <strong>Nota:</strong> Los administradores del sistema están exentos de las políticas de expiración de contraseñas.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

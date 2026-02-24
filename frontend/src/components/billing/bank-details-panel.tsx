
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import api from "@/lib/api"

interface BankDetails {
    bankName: string
    accountName: string
    accountNumber: string
    pixKey?: string
    iban?: string
    swift?: string
}

export function BankDetailsPanel() {
    const [details, setDetails] = useState<BankDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/payments/bank-details/')
            .then(res => setDetails(res.data))
            .catch(err => console.error("Error fetching bank details:", err))
            .finally(() => setLoading(false))
    }, [])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert("Copiado al portapapeles")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!details) return null

    return (
        <Card className="bg-muted/50 border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    Instrucciones de Transferencia
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-[11px] leading-relaxed text-blue-800 bg-blue-50/50 p-2.5 rounded border border-blue-100/50 mb-2">
                    Realiza la transferencia por el monto exacto y guarda el comprobante. Ingresa el número de referencia abajo para validar tu suscripción.
                </div>

                <div className="space-y-2">
                    <DetailItem label="Banco" value={details.bankName} onCopy={() => copyToClipboard(details.bankName)} />
                    <DetailItem label="Titular" value={details.accountName} onCopy={() => copyToClipboard(details.accountName)} />
                    <DetailItem label="Nº Cuenta" value={details.accountNumber} onCopy={() => copyToClipboard(details.accountNumber)} />
                    {details.pixKey && (
                        <DetailItem label="Clave PIX" value={details.pixKey} onCopy={() => copyToClipboard(details.pixKey)} />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function DetailItem({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-muted last:border-0">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{label}</span>
                <span className="text-sm font-mono">{value}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
                <Copy className="h-3 w-3" />
            </Button>
        </div>
    )
}

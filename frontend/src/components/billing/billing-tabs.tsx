"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlanSummaryCard } from "./plan-summary-card"
import { BillingAddressForm } from "./billing-address-form"
import { PaymentMethodsPanel } from "./payment-methods-panel"
import { InvoiceTable } from "./invoice-table"
import { CreditCard, MapPin, Wallet, FileText } from "lucide-react"

export function BillingTabs() {
    return (
        <Tabs defaultValue="plan" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
                <TabsTrigger value="plan" className="gap-1.5">
                    <CreditCard className="h-4 w-4 hidden sm:block" />
                    Plan
                </TabsTrigger>
                <TabsTrigger value="address" className="gap-1.5">
                    <MapPin className="h-4 w-4 hidden sm:block" />
                    Address
                </TabsTrigger>
                <TabsTrigger value="cards" className="gap-1.5">
                    <Wallet className="h-4 w-4 hidden sm:block" />
                    Cards
                </TabsTrigger>
                <TabsTrigger value="invoices" className="gap-1.5">
                    <FileText className="h-4 w-4 hidden sm:block" />
                    Invoices
                </TabsTrigger>
            </TabsList>

            <TabsContent value="plan">
                <PlanSummaryCard />
            </TabsContent>

            <TabsContent value="address">
                <BillingAddressForm />
            </TabsContent>

            <TabsContent value="cards">
                <PaymentMethodsPanel />
            </TabsContent>

            <TabsContent value="invoices">
                <InvoiceTable />
            </TabsContent>
        </Tabs>
    )
}

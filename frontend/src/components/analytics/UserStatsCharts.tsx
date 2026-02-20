"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { UserStats } from "@/services/analyticsApi"

interface UserStatsChartsProps {
    stats: UserStats
}

export function UserStatsCharts({ stats }: UserStatsChartsProps) {
    const data = [
        { name: "Libros Leídos", value: stats.books_completed, color: "#8884d8" },
        { name: "En Progreso", value: stats.books_reading, color: "#82ca9d" },
        { name: "Días Racha", value: stats.streak_days, color: "#ffc658" },
    ]

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Tu Actividad</CardTitle>
                <CardDescription>Resumen de tu progreso de lectura</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

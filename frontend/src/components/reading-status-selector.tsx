"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { userToast } from '@/lib/toast-utils';
import { toast } from '@/hooks/use-toast';
import { useBookStore } from "@/store/bookStore";

interface ReadingStatusSelectorProps {
    bookId: number;
    initialStatus?: "reading" | "completed" | "want_to_read" | "abandoned" | null;
    onStatusChange?: (status: string) => void;
}

type ReadingStatus = "reading" | "completed" | "want_to_read" | "abandoned";

const STATUS_OPTIONS = [
    {
        value: "want_to_read",
        label: "Quiero leer",
        icon: Clock,
        color: "text-blue-500",
    },
    {
        value: "reading",
        label: "Leyendo",
        icon: BookOpen,
        color: "text-yellow-500",
    },
    {
        value: "completed",
        label: "Completado",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: "abandoned",
        label: "Abandonado",
        icon: XCircle,
        color: "text-red-500",
    },
];

export function ReadingStatusSelector({
    bookId,
    initialStatus = null,
    onStatusChange,
}: ReadingStatusSelectorProps) {
    const [status, setStatus] = useState<string | null>(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const { updateReadingStatus } = useBookStore();

    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return;

        setIsUpdating(true);
        const oldStatus = status;

        // Optimistically update UI
        setStatus(newStatus);

        try {
            const payload: any = {
                status: newStatus,
            };

            // Auto-set dates based on status
            const now = new Date().toISOString();

            if (newStatus === "reading" && oldStatus !== "reading") {
                // Starting to read
                payload.started_at = now;
            }

            if (newStatus === "completed") {
                // Completed reading
                payload.completed_at = now;
                payload.progress_percentage = 100;

                // If never started, set started_at
                if (!oldStatus || oldStatus === "want_to_read") {
                    payload.started_at = now;
                }
            }

            await updateReadingStatus(bookId, payload);

            const selectedOption = STATUS_OPTIONS.find((opt) => opt.value === newStatus);

            toast({
                title: "Estado actualizado",
                description: `El libro ha sido marcado como "${selectedOption?.label}"`,
            });

            onStatusChange?.(newStatus);
        } catch (error: any) {
            // Revert on error
            setStatus(oldStatus);

            const errorMessage =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "No se pudo actualizar el estado. Por favor intenta de nuevo.";

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusIcon = () => {
        if (!status) return null;
        const option = STATUS_OPTIONS.find((opt) => opt.value === status);
        if (!option) return null;

        const Icon = option.icon;
        return <Icon className={`h-4 w-4 ${option.color}`} />;
    };

    return (
        <Select
            value={status || undefined}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
        >
            <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <SelectValue placeholder="Selecciona un estado de lectura" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${option.color}`} />
                                <span>{option.label}</span>
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

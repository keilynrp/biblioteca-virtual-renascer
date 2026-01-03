"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useBookStore } from "@/store/bookStore";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    bookId: number;
    initialFavorited?: boolean;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    showLabel?: boolean;
    className?: string;
}

export function FavoriteButton({
    bookId,
    initialFavorited = false,
    variant = "ghost",
    size = "default",
    showLabel = true,
    className,
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isLoading, setIsLoading] = useState(false);
    const { toggleFavorite } = useBookStore();

    useEffect(() => {
        setIsFavorited(initialFavorited);
    }, [initialFavorited]);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const favorited = await toggleFavorite(bookId);
            setIsFavorited(favorited);

            toast({
                title: favorited ? "Añadido a favoritos" : "Eliminado de favoritos",
                description: favorited
                    ? "El libro ha sido añadido a tu lista de favoritos"
                    : "El libro ha sido eliminado de tu lista de favoritos",
            });
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "No se pudo actualizar favoritos. Por favor intenta de nuevo.";

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });

            // Revertir el estado en caso de error
            setIsFavorited(!isFavorited);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleToggle}
            disabled={isLoading}
            className={cn("gap-2", className)}
            aria-label={isFavorited ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
            <Heart
                className={cn(
                    "h-5 w-5 transition-all",
                    isFavorited ? "fill-red-500 text-red-500" : "text-current",
                    isLoading && "animate-pulse"
                )}
            />
            {showLabel && (
                <span>
                    {isLoading
                        ? "Actualizando..."
                        : isFavorited
                        ? "En favoritos"
                        : "Añadir a favoritos"}
                </span>
            )}
        </Button>
    );
}

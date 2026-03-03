"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userToast } from '@/lib/toast-utils';
import { toast } from '@/hooks/use-toast';
import { useBookStore } from "@/store/bookStore";

interface ReviewFormProps {
    bookSlug: string;
    onSuccess?: () => void;
}

export function ReviewForm({ bookSlug, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addReview } = useBookStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación
        if (rating === 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor selecciona una calificación",
            });
            return;
        }

        if (!title.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor escribe un título para tu reseña",
            });
            return;
        }

        if (!comment.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor escribe un comentario",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await addReview(bookSlug, {
                rating,
                title: title.trim(),
                comment: comment.trim(),
            });

            toast({
                title: "Reseña publicada",
                description: "Tu reseña ha sido publicada exitosamente",
            });

            // Limpiar formulario
            setRating(0);
            setTitle("");
            setComment("");

            onSuccess?.();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "No se pudo publicar la reseña. Por favor intenta de nuevo.";

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Escribe tu reseña</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating Stars */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Calificación *
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                >
                                    <Star
                                        className={`h-8 w-8 transition-colors ${star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground self-center">
                                    {rating}/5
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="text-sm font-medium mb-2 block">
                            Título de la reseña *
                        </label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Ej: Un libro excelente"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {title.length}/200 caracteres
                        </p>
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                            Tu comentario *
                        </label>
                        <Textarea
                            id="comment"
                            placeholder="Comparte tu opinión sobre este libro..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={6}
                            disabled={isSubmitting}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Mínimo 10 caracteres
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || !rating || !title.trim() || !comment.trim()}
                        className="w-full"
                    >
                        {isSubmitting ? "Publicando..." : "Publicar reseña"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

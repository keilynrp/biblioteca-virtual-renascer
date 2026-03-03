"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userToast } from '@/lib/toast-utils';
import { useBookStore } from "@/store/bookStore";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewListProps {
    bookSlug: string;
}

interface Review {
    id: number;
    user: {
        id: number;
        username: string;
        avatar?: string;
    };
    rating: number;
    title: string;
    comment: string;
    helpful_count: number;
    user_has_voted_helpful: boolean;
    is_verified_reader: boolean;
    created_at: string;
    updated_at: string;
}

export function ReviewList({ bookSlug }: ReviewListProps) {
    const { reviews, fetchReviews, markReviewHelpful } = useBookStore();
    const [isLoading, setIsLoading] = useState(true);
    const [votingReviewId, setVotingReviewId] = useState<number | null>(null);

    useEffect(() => {
        loadReviews();
    }, [bookSlug]);

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            await fetchReviews(bookSlug);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las reseñas",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleHelpfulClick = async (reviewId: number) => {
        setVotingReviewId(reviewId);
        try {
            await markReviewHelpful(reviewId);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                "No se pudo procesar tu voto. Por favor intenta de nuevo.";

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setVotingReviewId(null);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getInitials = (username: string) => {
        return username.slice(0, 2).toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Asegurar que reviews es un array
    const reviewsList = Array.isArray(reviews) ? reviews : [];

    if (reviewsList.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>Aún no hay reseñas para este libro.</p>
                    <p className="text-sm mt-2">¡Sé el primero en escribir una!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {reviewsList.map((review: Review) => (
                <Card key={review.id}>
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={review.user.avatar}
                                    alt={review.user.username}
                                />
                                <AvatarFallback>
                                    {getInitials(review.user.username)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Review Content */}
                            <div className="flex-1 space-y-2">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                {review.user.username}
                                            </span>
                                            {review.is_verified_reader && (
                                                <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                    <BadgeCheck className="h-3 w-3" />
                                                    <span>Lector verificado</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {renderStars(review.rating)}
                                            <span className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(review.created_at), {
                                                    addSuffix: true,
                                                    locale: es,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h4 className="font-semibold text-lg">{review.title}</h4>

                                {/* Comment */}
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {review.comment}
                                </p>

                                {/* Helpful Button */}
                                <div className="pt-2">
                                    <Button
                                        variant={
                                            review.user_has_voted_helpful ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() => handleHelpfulClick(review.id)}
                                        disabled={votingReviewId === review.id}
                                        className="gap-2"
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>
                                            Útil {review.helpful_count > 0 && `(${review.helpful_count})`}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

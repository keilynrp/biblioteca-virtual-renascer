"use client"

import React, { useState, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: File | string | null
    onChange: (file: File | null) => void
    onRemove: () => void
    className?: string
    disabled?: boolean
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    className,
    disabled
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string' ? value : null
    )

    React.useEffect(() => {
        if (typeof value === 'string') {
            setPreview(value)
        } else if (!value) {
            setPreview(null)
        }
    }, [value])

    const handleFileChange = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecciona un archivo de imagen válido.")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        onChange(file)
    }, [onChange])

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (disabled) return

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0])
        }
    }, [disabled, handleFileChange])

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        if (disabled) return
        setIsDragging(true)
    }, [disabled])

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const onFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0])
        }
    }, [handleFileChange])

    const handleRemove = useCallback(() => {
        setPreview(null)
        onRemove()
    }, [onRemove])

    return (
        <div className={cn("space-y-4 w-full", className)}>
            {preview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <div className="absolute top-2 right-2 z-10">
                        <Button
                            type="button"
                            onClick={handleRemove}
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <Image
                        fill
                        className="object-cover"
                        alt="Vista previa"
                        src={preview}
                    />
                </div>
            ) : (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 text-center transition hover:bg-muted/50",
                        isDragging && "border-primary bg-primary/5",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileInputChange}
                        disabled={disabled}
                        className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                    />

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {isDragging ? "Suelta la imagen aquí" : "Haz clic o arrastra una imagen"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Formatos: JPG, PNG, WebP (Máx. 2MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}


"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface AvatarUploadProps {
    currentAvatar?: string
    username: string
    onFileSelect: (file: File) => void
}

export function AvatarUpload({ currentAvatar, username, onFileSelect }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatar || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            onFileSelect(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
                <AvatarImage src={preview || ""} alt={username} />
                <AvatarFallback className="text-4xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md">
                        <Upload className="h-4 w-4" />
                        <span>Change Avatar</span>
                    </div>
                    <Input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </Label>
            </div>
        </div>
    )
}

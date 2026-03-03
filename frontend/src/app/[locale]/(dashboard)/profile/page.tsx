"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { userToast } from '@/lib/toast-utils'
import { toast } from '@/hooks/use-toast'
import { Camera, Mail, Phone, Building2, Edit2, Lock, CreditCard, User2 } from "lucide-react"
import { SubscriptionInfo } from "@/components/subscriptions/subscription-info"
import Image from "next/image"
import { getAvatarUrl } from "@/lib/utils"

const profileSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    institution_id: z.string().nullable().optional(),
})

interface Institution {
    id: number
    name: string
}

export default function ProfilePage() {
    const { user, login } = useAuthStore()
    const [institutions, setInstitutions] = useState<Institution[]>([])
    const [loading, setLoading] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: "",
            email: "",
            bio: "",
            phone: "",
            institution_id: "",
        },
    })

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                const [instResponse, userResponse] = await Promise.all([
                    api.get('/institutions/'),
                    api.get('/auth/user/')
                ])
                // Handle paginated response
                const institutionsData = instResponse.data?.results || instResponse.data || []
                setInstitutions(Array.isArray(institutionsData) ? institutionsData : [])

                const userData = userResponse.data

                // Synchronize authStore with latest data from backend
                const { accessToken, refreshToken } = useAuthStore.getState()
                if (accessToken && refreshToken) {
                    login(userData, accessToken, refreshToken)
                }

                form.reset({
                    username: userData.username,
                    email: userData.email,
                    bio: userData.bio || "",
                    phone: userData.phone || "",
                    institution_id: userData.institution_id ? String(userData.institution_id) : null,
                })
            } catch (error) {
                console.error("Failed to load profile data", error)
                setInstitutions([])
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load profile data. Please refresh the page."
                })
            }
        }
        loadData()
    }, [form])

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('bio', values.bio || '')
            formData.append('phone', values.phone || '')
            if (values.institution_id) {
                formData.append('institution_id', values.institution_id)
            } else if (values.institution_id === null) {
                formData.append('institution_id', '') // Clear institution if null
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile)
            }

            const response = await api.patch('/auth/user/update/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            // Update local store
            const { accessToken, refreshToken } = useAuthStore.getState()
            login(response.data, accessToken!, refreshToken!)

            toast({
                title: "Success",
                description: "Profile updated successfully!",
            })
            setShowEditModal(false)
            setAvatarFile(null)
        } catch (error) {
            console.error("Failed to update profile", error)
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!user) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        </div>
    )

    const userInstitution = institutions.find(inst => inst.id === user.institution_id)

    return (
        <div className="px-10 py-5 space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Profile Header Card */}
            <Card className="border-border/50">
                <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        {/* Avatar and Info */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full border-2 border-border overflow-hidden bg-muted">
                                    {user.avatar ? (
                                        <Image
                                            src={getAvatarUrl(user.avatar) ?? ''}
                                            alt={user.username}
                                            width={96}
                                            height={96}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                            <User2 className="h-12 w-12 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                                    aria-label="Change avatar"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                    {user.username}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {user.email}
                                </p>
                                {user.bio && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                        {user.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => setShowEditModal(true)}
                                className="w-full sm:w-auto"
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Information Card */}
                <Card className="border-border/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <User2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Your account details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-sm text-gray-900 dark:text-white break-all">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {user.phone}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {userInstitution && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-muted-foreground">Institution</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {userInstitution.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!user.phone && !userInstitution && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Complete your profile information
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Add Details
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="border-border/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Password and account security</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                {/* Subscription Card */}
                <Card className="border-border/50 lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <CardTitle>Subscription</CardTitle>
                                <CardDescription>Manage your subscription plan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SubscriptionInfo />
                    </CardContent>
                </Card>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Update your personal information and profile picture
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Avatar Upload Section */}
                            <div className="flex justify-center pb-4 border-b">
                                <AvatarUpload
                                    username={user.username}
                                    currentAvatar={getAvatarUrl(user.avatar)}
                                    onFileSelect={setAvatarFile}
                                />
                            </div>

                            {/* Form Fields */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Username cannot be changed
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Email cannot be changed
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about yourself"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="institution_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value ?? undefined}
                                                value={field.value ?? undefined}
                                                disabled={user.user_type !== 'admin'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an institution" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin institución</SelectItem>
                                                    {Array.isArray(institutions) && institutions.length > 0 ? (
                                                        institutions.map((inst) => (
                                                            <SelectItem key={inst.id} value={String(inst.id)}>
                                                                {inst.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="no-avail" disabled>
                                                            No institutions available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setAvatarFile(null)
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ChangePasswordForm() {
    const [loading, setLoading] = useState(false)
    const formSchema = z.object({
        old_password: z.string().min(1, "Current password is required"),
        new_password: z.string().min(6, "New password must be at least 6 characters"),
        confirm_password: z.string().min(6, "Confirm password must be at least 6 characters"),
    }).refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords don't match",
        path: ["confirm_password"],
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            old_password: "",
            new_password: "",
            confirm_password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await api.put('/auth/password/change/', {
                old_password: values.old_password,
                new_password: values.new_password
            })
            toast({
                title: "Success",
                description: "Password changed successfully!",
            })
            form.reset()
        } catch (error: any) {
            console.error("Failed to change password", error)
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to change password. Please check your current password.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="old_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="new_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirm_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </Form>
    )
}


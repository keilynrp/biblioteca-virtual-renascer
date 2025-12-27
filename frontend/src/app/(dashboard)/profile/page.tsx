
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
import { toast } from "@/hooks/use-toast"

const profileSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    institution_id: z.string().optional(),
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
                setInstitutions(instResponse.data)

                const userData = userResponse.data
                form.reset({
                    username: userData.username,
                    email: userData.email,
                    bio: userData.bio || "",
                    phone: userData.phone || "",
                    institution_id: userData.institution_id ? String(userData.institution_id) : "",
                })
            } catch (error) {
                console.error("Failed to load profile data", error)
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
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile)
            }

            const response = await api.patch('/auth/user/update/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            // Update local store
            const { access, refresh } = useAuthStore.getState()
            login(response.data, access!, refresh!)

            toast({
                title: "Success",
                description: "Profile updated successfully!",
            })
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

    if (!user) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Profile</h2>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <AvatarUpload
                                username={user.username}
                                currentAvatar={user.avatar}
                                onFileSelect={setAvatarFile}
                            />
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                            <FormDescription>Username cannot be changed.</FormDescription>
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
                                            <FormDescription>Email cannot be changed.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Tell us about yourself" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an institution" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {institutions.map((inst) => (
                                                        <SelectItem key={inst.id} value={String(inst.id)}>
                                                            {inst.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChangePasswordForm />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription</CardTitle>
                            <CardDescription>Your current plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SubscriptionInfo />
                        </CardContent>
                    </Card>
                </div>
            </div>
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
                description: "Failed to change password. Please check your current password.",
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
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
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
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </Form>
    )
}

function SubscriptionInfo() {
    const [subscription, setSubscription] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [canceling, setCanceling] = useState(false)

    useEffect(() => {
        fetchSubscription()
    }, [])

    async function fetchSubscription() {
        try {
            const response = await api.get('/subscriptions/my-subscription/')
            setSubscription(response.data)
        } catch (error) {
            // Ignore 404
        } finally {
            setLoading(false)
        }
    }

    async function handleCancelSubscription() {
        setCanceling(true)
        try {
            await api.post('/subscriptions/cancel/')
            toast({
                title: "Success",
                description: "Subscription cancelled successfully.",
            })
            setShowCancelDialog(false)
            fetchSubscription()
        } catch (error) {
            console.error("Failed to cancel subscription", error)
            toast({
                title: "Error",
                description: "Failed to cancel subscription. Please try again.",
                variant: "destructive",
            })
        } finally {
            setCanceling(false)
        }
    }

    if (loading) return <div>Loading...</div>
    if (!subscription) return (
        <div className="text-center space-y-4">
            <p>No active subscription.</p>
            <Button asChild>
                <Link href="/plans">View Plans</Link>
            </Button>
        </div>
    )

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div>
                        <p className="font-semibold text-lg">{subscription.plan_detail.name}</p>
                        <p className="text-sm text-muted-foreground">Expires: {new Date(subscription.end_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Active
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild className="flex-1">
                        <Link href="/plans">Change Plan</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setShowCancelDialog(true)}
                        className="flex-1"
                    >
                        Cancel Subscription
                    </Button>
                </div>
            </div>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={canceling}>
                            Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSubscription} disabled={canceling}>
                            {canceling ? "Canceling..." : "Yes, Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

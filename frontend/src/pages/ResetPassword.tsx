import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState } from 'react';

const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await resetPassword(email);
            // Handle successful password reset
        } catch (error) {
            // Handle error
        }
    };

    return (
        <div className='flex items-center justify-center h-screen w-screen bg-gray-500'>
            <form onSubmit={handleSubmit}>
                <Card className="mx-auto  max-w-sm ">
                    <CardHeader>
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            Enter your registered email below to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Reset Password
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default ResetPassword;

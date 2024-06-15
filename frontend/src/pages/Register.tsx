import { useAuth } from "../context/AuthContext";
import { ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate(); // Using useNavigate here

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const userName = email.split("@")[0];
      const success = await register(userName, email, password);
      // Handle successful registration
      if (success) {
        navigate("/login"); // Redirect to login page using navigate
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-500">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <Card className="mx-auto max-w-sm ">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Fill in the below form to register with your email and password
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Register;

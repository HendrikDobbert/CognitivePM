"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createOrUpdateUser } from "@/services/user-service";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(`AuthForm: onSubmit called for mode: ${mode}`, values);
    setLoading(true);
    try {
      if (mode === "register") {
        console.log("AuthForm: Attempting to register...");
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        console.log("AuthForm: Registration successful in Firebase Auth.", userCredential.user);
        await createOrUpdateUser(userCredential.user);
        console.log("AuthForm: createOrUpdateUser called for registration.");
      } else {
        console.log("AuthForm: Attempting to sign in...");
        await signInWithEmailAndPassword(auth, values.email, values.password);
        console.log("AuthForm: Sign-in successful.");
      }
      // The useAuth hook will handle the redirect, so we don't need to setLoading(false) here.
       console.log("AuthForm: Auth action completed. Waiting for useAuth to redirect.");
    } catch (error: any) {
       console.error(`AuthForm: Auth failed in ${mode} mode.`, error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
      setLoading(false); // Only set loading to false on error
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("AuthForm: Starting Google Sign-In...");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("AuthForm: Google Sign-In successful in Firebase Auth.", userCredential.user);
      await createOrUpdateUser(userCredential.user);
      console.log("AuthForm: createOrUpdateUser called for Google Sign-In.");
      // The useAuth hook will handle the redirect
      console.log("AuthForm: Google Sign-In process finished. Waiting for useAuth to redirect.");
    } catch (error: any) {
      console.error("AuthForm: Google Sign-In failed.", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Google Sign-In failed",
          description: error.message,
        });
      }
      setLoading(false); // Only set loading to false on error
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" {...register("email")} disabled={loading} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} disabled={loading} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "register" ? "Create an account" : "Sign In"}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
        )}
        Google
      </Button>
    </div>
  );
}

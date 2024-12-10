"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/axios";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { AxiosError } from "axios";

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "First Name cannot be empty.")
    .max(30, "First name cannot exceed 30 characters."),
  lastName: z.string().max(30, "Last name cannot exceed 30 characters."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(20, "Password cannot exceed 20 characters."),
  username: z.string().email("Invalid email address.").min(5).max(50),
});

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState({ message: "" });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { firstName, lastName, username, password } = values;
      const response = await apiClient.post("/user/signup", {
        firstName,
        lastName,
        username,
        password,
      });
      localStorage.setItem("token", response.data?.token);

      alert("User registered successfully!");
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data) {
          setErrorMessage(error.response.data);
        } else {
          alert("An error occurred while registering.");
        }
      } else {
        // Fallback (unlikely if error is always AxiosError)
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    }
  }

  useEffect(() => {
    apiClient
      .get("/user/me", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then(() => router.push("/"))
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex justify-center items-center">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Let&#39;s get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="johndoe@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="123456" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 6 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </Form>

          <div className="text-red-500 font-medium text-center">
            {errorMessage.message}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p>
            Already have an account. Sign in{" "}
            <Link href={"/auth/signin"} className="underline text-blue-700">
              here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

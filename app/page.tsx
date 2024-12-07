"use client";

import Loader from "@/components/Loader";
import { apiClient } from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/user/me", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then(() => setLoading(false))
      .catch(() => router.push("/auth/signin"));
  });

  if (loading) return <Loader />;

  return <div>hi there</div>;
}

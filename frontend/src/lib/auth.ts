// lib/auth/logout.ts

import { env } from "@/src/config/env"

export async function logout() {
  try {
    const response = await fetch(`${env.API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error("Logout failed")
    }
    // redirect user
    window.location.href = "/"
    return await response.json()
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}
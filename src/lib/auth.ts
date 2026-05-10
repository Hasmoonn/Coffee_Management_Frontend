// src/lib/auth.ts
"use client";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") 
    return false;
  
  return !!localStorage.getItem("accessToken");
}
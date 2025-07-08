import { APIResponse, AuthHeaders, User } from "@/types"
import { type ClassValue, clsx } from "clsx"
import { NextResponse } from "next/server"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions for API responses
export async function ok<T>(data: T): APIResponse<T> {
  return NextResponse.json({
    success: true,
    error: null,
    data,
  }, {status: 200})
}

export async function err<T>(error: string, status: number): APIResponse<T> {
  return NextResponse.json({
    success: false,
    error,
    data: null,
  }, {status})
}


export function internalServerError<T>(): APIResponse<T> {
  return err("Internal Server Error", 500)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024

  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️"
  if (mimeType.startsWith("video/")) return "🎥"
  if (mimeType.startsWith("audio/")) return "🎵"
  if (mimeType.includes("pdf")) return "📄"
  if (mimeType.includes("word")) return "📝"
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊"
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📈"
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦"
  return "📎"
}



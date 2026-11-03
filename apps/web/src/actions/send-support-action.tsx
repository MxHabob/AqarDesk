"use server"

import { z } from "zod"
import { sendSupportEmail } from "@/lib/support/send-support-email"
import { authActionClient } from "./safe-action"

export const sendSupportAction = authActionClient
  .schema(
    z.object({
      subject: z.string().trim().min(3).max(200),
      priority: z.enum(["low", "normal", "high", "urgent", "0", "1", "2", "3"]),
      type: z.string().trim().min(1).max(80),
      message: z.string().trim().min(10).max(5000),
      url: z
        .string()
        .url()
        .max(2048)
        .refine((value) => {
          const { protocol, username, password } = new URL(value)
          return (
            (protocol === "http:" || protocol === "https:") &&
            !username &&
            !password
          )
        })
        .optional(),
    })
  )
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    if (!user.email) {
      throw new Error("An email address is required to send a support request.")
    }

    return sendSupportEmail({
      ...data,
      email: user.email,
      fullName: user.name || user.email,
    })
  })

"use server"

import { sendSupportEmail } from "@/lib/support/send-support-email"
import { actionClient } from "./safe-action"
import { sendSupportSchema } from "./schema"

export const sendSupportAction = actionClient
  .schema(sendSupportSchema)
  .action(async ({ parsedInput: data }) => {
    return sendSupportEmail({
      ...data,
      fullName: data.fullName,
    })
  })

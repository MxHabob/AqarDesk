"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { useUserMutation, useUserQuery } from "@/hooks/use-user"

export function TimeFormatSettings() {
  const updateUserMutation = useUserMutation()
  const { data: user } = useUserQuery()

  return (
    <Card className="flex justify-between items-center">
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          Time Display Format
        </CardTitle>
        <CardDescription>
          Choose between 12-hour or 24-hour clock format for displaying time.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Select
          value={user?.timeFormat?.toString() ?? undefined}
          onValueChange={(value) => {
            if (!value) return
            updateUserMutation.mutate({ timeFormat: +value })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue
              placeholder="Time format"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 hours (AM/PM)</SelectItem>
            <SelectItem value="24">24 hours</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

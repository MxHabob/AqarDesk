"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card";
import { Button } from "@aqardesk/ui/button";
import { Input } from "@aqardesk/ui/input";
import { useUserQuery } from "@/hooks/use-user";

export function ChangeEmail() {
  const { data: user } = useUserQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">Email</CardTitle>
        <CardDescription>Change your email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          id="account-email"
          className="max-w-[300px]"
          value={user?.email ?? ""}
          readOnly
          dir="ltr"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>This is your primary email address for notifications and more.</div>
        <Button type="button" disabled>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}

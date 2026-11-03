"use client";

import { Button } from "@aqardesk/ui/button";
import { Icons } from "@aqardesk/ui/icons";

export function VaultUploadButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => document.getElementById("upload-files")?.click()}
    >
      <Icons.Add size={17} />
    </Button>
  );
}

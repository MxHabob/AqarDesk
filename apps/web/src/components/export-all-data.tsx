"use client"

import { Button } from "@aqardesk/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { useToast } from "@aqardesk/ui/use-toast"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { exportOfficeDataAction } from "@/actions/office-export"
import { downloadFile } from "@/lib/download"
import { useExportStore } from "@/store/export"

export function ExportAllData() {
  const { toast } = useToast()
  const { isExporting, setExportData, setIsExporting } = useExportStore()
  const mutation = useMutation({
    mutationFn: async () => {
      setExportData({ exportType: "team-data" })
      setIsExporting(true)
      try {
        const data = await exportOfficeDataAction()
        await downloadFile(data.url, data.fileName)
        return data
      } finally {
        setExportData(undefined)
        setIsExporting(false)
      }
    },
    onSuccess: ({ totalItems }) => {
      toast({
        variant: "success",
        title: `Export completed (${totalItems} records).`,
      })
    },
    onError: (error) => toast({ variant: "error", title: error.message }),
  })

  const busy = mutation.isPending || isExporting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export all data</CardTitle>
        <CardDescription>
          Download a JSON export of the properties, listings, and owner records
          you are permitted to view.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={() => mutation.mutate()} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin me-2" />
              Exporting…
            </>
          ) : (
            "Export"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

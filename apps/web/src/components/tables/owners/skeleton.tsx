import { Skeleton } from "@aqardesk/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"

const headers = ["المالك", "ملاحظات داخلية", "تاريخ الإضافة", "الإجراءات"]

export function OwnersSkeleton() {
  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4 py-6">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="size-9" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <Table containerClassName="min-h-0 flex-1 overflow-auto scrollbar-hide">
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            "owner-skeleton-1",
            "owner-skeleton-2",
            "owner-skeleton-3",
            "owner-skeleton-4",
            "owner-skeleton-5",
            "owner-skeleton-6",
            "owner-skeleton-7",
            "owner-skeleton-8",
            "owner-skeleton-9",
            "owner-skeleton-10",
            "owner-skeleton-11",
            "owner-skeleton-12",
          ].map((key) => (
            <TableRow key={key}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

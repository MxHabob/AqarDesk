import { Skeleton } from "@aqardesk/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"

const headers = ["العقار", "نوع الإعلان", "الحالة", "السعر", "الإجراءات"]

export function ListingsSkeleton() {
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
            "listing-skeleton-1",
            "listing-skeleton-2",
            "listing-skeleton-3",
            "listing-skeleton-4",
            "listing-skeleton-5",
            "listing-skeleton-6",
            "listing-skeleton-7",
            "listing-skeleton-8",
            "listing-skeleton-9",
            "listing-skeleton-10",
            "listing-skeleton-11",
            "listing-skeleton-12",
          ].map((key) => (
            <TableRow key={key}>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
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

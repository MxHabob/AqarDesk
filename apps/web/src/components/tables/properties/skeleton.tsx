import { Skeleton } from "@aqardesk/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"

const headers = ["العقار", "المدينة", "الحي", "المساحة", "الإجراءات"]

export function PropertiesSkeleton() {
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
            "property-skeleton-1",
            "property-skeleton-2",
            "property-skeleton-3",
            "property-skeleton-4",
            "property-skeleton-5",
            "property-skeleton-6",
            "property-skeleton-7",
            "property-skeleton-8",
            "property-skeleton-9",
            "property-skeleton-10",
            "property-skeleton-11",
            "property-skeleton-12",
          ].map((key) => (
            <TableRow key={key}>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
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

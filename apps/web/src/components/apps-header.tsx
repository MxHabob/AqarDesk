import { apps as officialApps } from "@aqardesk/app-store";
import { AppsTabs } from "./apps-tabs";
import { SearchField } from "./search-field";

const totalApps = officialApps.filter((app) => !app.id.endsWith("-mcp")).length;

export function AppsHeader() {
  return (
    <div className="flex gap-x-4">
      <AppsTabs />
      <SearchField placeholder={`Search ${totalApps} apps`} shallow />
    </div>
  );
}

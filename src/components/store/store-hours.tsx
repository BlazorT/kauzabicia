// src/components/store/StoreInfo/components/StoreHours.tsx
import { Clock10 } from "lucide-react";
import moment from "moment";
import { CollapsibleCard } from "@/components/ui/collapsible";

interface StoreHoursProps {
  isAlwaysOpen: boolean;
  statusText: string;
  todayHours?: { WorkStartTime: string; WorkEndTime: string };
  weeklyGroups: Array<{
    key: string;
    label: string;
    start: string;
    end: string;
  }>;
}

export const StoreHours = ({
  isAlwaysOpen,
  statusText,
  todayHours,
  weeklyGroups,
}: StoreHoursProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Opening Hours</h2>
      {isAlwaysOpen ? (
        <div className="flex items-center gap-2 text-lg">
          <Clock10 size={18} className="text-muted-foreground" />
          <span>Open 24/7</span>
        </div>
      ) : (
        <CollapsibleCard
          header={
            <div className="flex items-center gap-2">
              <Clock10 size={18} className="text-muted-foreground" />
              <span className="font-medium">{statusText}</span>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium">Today&apos;s Hours</h3>
              <p className="text-muted-foreground">
                {todayHours
                  ? `${moment(todayHours.WorkStartTime, "HH:mm:ss").format(
                      "h:mm A"
                    )} - ${moment(todayHours.WorkEndTime, "HH:mm:ss").format(
                      "h:mm A"
                    )}`
                  : "Closed"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Weekly Schedule</h3>
              <ul className="mt-2 space-y-3">
                {weeklyGroups.map((group) => (
                  <li key={group.key} className="flex justify-between">
                    <span>{group.label}</span>
                    <span className="text-muted-foreground">
                      {moment(group.start, "HH:mm:ss").format("h:mm A")} -{" "}
                      {moment(group.end, "HH:mm:ss").format("h:mm A")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleCard>
      )}
    </div>
  );
};

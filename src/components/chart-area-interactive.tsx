"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useFetchOrderStats } from "@/hooks/useOrder";

export type OrderStats = {
  delivered: number;
  dispatched: number;
  hour: number;
  inprogress: number;
  ready: number;
  statsday: number;
};

export type OrderStatsResponse = {
  data: OrderStats[];
};

export const description = "An interactive area chart";

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const { data } = useFetchOrderStats() as { data: OrderStatsResponse };
  // Process the data to combine stats and create comparison
  const processedData = React.useMemo(() => {
    if (!data?.data) return { data: [], totalToday: 0, totalYesterday: 0 };

    // Create an array of 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Initialize data structure for all hours
    const baseData = hours.map((hour) => ({
      hour,
      today: 0,
      yesterday: 0,
    }));

    let totalToday = 0;
    let totalYesterday = 0;

    // Fill in the actual data
    data.data.forEach((stat: OrderStats) => {
      const totalOrders =
        stat.ready + stat.inprogress + stat.delivered + stat.dispatched;

      // Convert UTC hour to local hour
      const date = new Date();
      date.setUTCHours(stat.hour, 0, 0);
      const localHour = date.getHours();

      const hourIndex = baseData.findIndex((item) => item.hour === localHour);

      if (hourIndex !== -1) {
        if (stat.statsday === 1) {
          baseData[hourIndex].today = totalOrders;
          totalToday += totalOrders;
        } else if (stat.statsday === 2) {
          baseData[hourIndex].yesterday = totalOrders;
          totalYesterday += totalOrders;
        }
      }
    });

    return { data: baseData, totalToday, totalYesterday };
  }, [data]);

  const chartConfig = {
    today: {
      label: `Today (${processedData.totalToday})`,
      color: "var(--primary)",
    },
    yesterday: {
      label: `Yesterday (${processedData.totalYesterday})`,
      color: "var(--muted-foreground)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Order Statistics</CardTitle>
        <CardDescription>
          Comparison of orders between today and yesterday
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={processedData.data}>
            <defs>
              <linearGradient id="fillToday" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-today)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-today)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillYesterday" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-yesterday)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-yesterday)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={isMobile ? 5 : 30}
              tickFormatter={(value) => {
                const date = new Date();
                date.setHours(value, 0, 0);
                return date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  hour12: true,
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const date = new Date();
                    date.setHours(payload?.[0]?.payload?.hour, 0, 0);
                    return date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      hour12: true,
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="yesterday"
              type="bump"
              fill="url(#fillYesterday)"
              stroke="var(--color-yesterday)"
              stackId="a"
            />
            <Area
              dataKey="today"
              type="bump"
              fill="url(#fillToday)"
              stroke="var(--color-today)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

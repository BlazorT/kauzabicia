import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchOrderStats } from "@/hooks/useOrder";
import moment from "moment";
import { useMemo } from "react";
import { OrderStatsResponse } from "./chart-area-interactive";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

export function SectionCards() {
  const { data } = useFetchOrderStats() as { data: OrderStatsResponse };

  const timeDistribution = useMemo(() => {
    if (!data?.data) return { morning: 0, noon: 0, evening: 0, total: 0 };

    let morning = 0;
    let noon = 0;
    let evening = 0;
    let total = 0;

    data.data.forEach((stat) => {
      if (stat.statsday === 1) {
        // Only process today's data
        const totalOrders =
          stat.ready + stat.inprogress + stat.delivered + stat.dispatched;
        total += totalOrders;

        const utcMoment = moment.utc();
        utcMoment.hour(stat.hour);
        const localHour = Number(utcMoment.local().format("H"));

        if (localHour >= 0 && localHour < 9) {
          morning += totalOrders;
        } else if (localHour >= 9 && localHour < 19) {
          noon += totalOrders;
        } else if (localHour >= 19 && localHour <= 23) {
          evening += totalOrders;
        }
      }
    });

    return { morning, noon, evening, total };
  }, [data]);

  const statusDistribution = useMemo(() => {
    if (!data?.data) return [];

    let inProgress = 0;
    let dispatched = 0;
    let delivered = 0;
    let total = 0;

    data.data.forEach((stat) => {
      if (stat.statsday === 1) {
        // Only process today's data
        inProgress += stat.ready + stat.inprogress;
        dispatched += stat.dispatched;
        delivered += stat.delivered;
        total +=
          stat.ready + stat.inprogress + stat.dispatched + stat.delivered;
      }
    });

    return [
      {
        name: "In Progress",
        value: inProgress,
        fill: "var(--destructive)",
      },
      {
        name: "Dispatched",
        value: dispatched,
        fill: "var(--chart-3)",
      },
      {
        name: "Delivered",
        value: delivered,
        fill: "var(--chart-2)",
      },
      {
        name: "Total Orders",
        value: total,
        fill: "var(--primary)",
      },
    ];
  }, [data]);

  const barConfig = {
    progress: {
      label: "progress",
      color: "hsl(var(--primary))",
    },
    Dispatched: {
      label: "Dispatched",
      color: "var(--primary)",
    },
    delivered: {
      label: "delivered",
      color: "hsl(var(--accent))",
    },
    total: {
      label: "total",
      color: "hsl(var(--accent))",
    },
    label: {
      color: "var(--card-foreground)",
    },
  } satisfies ChartConfig;

  const chartConfig = {
    morning: {
      label: "Morning",
      color: "hsl(var(--primary))",
    },
    noon: {
      label: "Noon",
      color: "var(--primary)",
    },
    evening: {
      label: "Evening",
      color: "hsl(var(--accent))",
    },
  } satisfies ChartConfig;

  const pieData = [
    {
      name: "morning",
      value: timeDistribution.morning,
      fill: "var(--chart-2)",
    },
    { name: "noon", value: timeDistribution.noon, fill: "var(--chart-1)" },
    {
      name: "evening",
      value: timeDistribution.evening,
      fill: "var(--chart-3)",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="flex flex-col lg:col-span-2">
        <CardHeader className="items-center pb-0">
          <CardTitle>Order Distribution</CardTitle>
          <CardDescription>Today&apos;s orders by time of day</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {timeDistribution.total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Orders
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Today&apos;s orders by status</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={barConfig}>
            <BarChart
              accessibilityLayer
              data={statusDistribution}
              layout="vertical"
              margin={{
                left: 8,
              }}
            >
              <CartesianGrid horizontal={false} className="bg-primary" />
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={0}
                axisLine={false}
                // tickFormatter={(value) => value}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="value" fill="var(--primary)" radius={4}>
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={8}
                  fontSize={12}
                  className="fill-foreground"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Label } from "../ui/label";

interface CheckoutCardProps {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
}

export default function CheckoutCard({
  children,
  title,
  icon,
}: CheckoutCardProps) {
  return (
    <Card className="flex gap-2 flex-col py-2 px-2">
      <Collapsible>
        <CollapsibleTrigger>
          <CardHeader className="flex items-center gap-2">
            {icon}
            <Label>{title}</Label>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

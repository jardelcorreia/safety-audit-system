import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className 
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {trend && (
              <p className={cn(
                "text-sm",
                trendUp ? "text-green-600" : "text-yellow-600"
              )}>
                {trend}
              </p>
            )}
          </div>
          <Icon className={cn("h-8 w-8", className || "text-gray-400")} />
        </div>
      </CardContent>
    </Card>
  );
}

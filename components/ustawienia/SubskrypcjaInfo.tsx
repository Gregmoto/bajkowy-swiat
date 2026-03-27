import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Informacje o subskrypcji — aktualny plan, daty, limity, upgrade
export default function SubskrypcjaInfo() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Aktualny plan</CardTitle>
          <Badge>Darmowy</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Bajki w tym miesiącu</p>
              <p className="font-semibold">0 / 5</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profile dzieci</p>
              <p className="font-semibold">0 / 2</p>
            </div>
          </div>
          <Button className="w-full">Przejdź na plan Premium</Button>
        </CardContent>
      </Card>
    </div>
  );
}

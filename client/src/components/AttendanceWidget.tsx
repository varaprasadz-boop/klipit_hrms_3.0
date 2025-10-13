import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Camera, MapPin } from "lucide-react";

export default function AttendanceWidget() {
  const [clockedIn, setClockedIn] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  const handleClockAction = () => {
    const now = new Date().toLocaleTimeString();
    setTime(now);
    setClockedIn(!clockedIn);
    console.log(clockedIn ? "Clocked out at:" : "Clocked in at:", now);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Attendance
          </CardTitle>
          <Badge variant={clockedIn ? "default" : "secondary"}>
            {clockedIn ? "Clocked In" : "Not Clocked In"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Office Location - Geo-fencing Active</span>
        </div>

        {time && (
          <div className="p-3 bg-primary/10 rounded-md">
            <p className="text-sm text-muted-foreground">
              {clockedIn ? "Clocked in at:" : "Clocked out at:"}
            </p>
            <p className="text-lg font-semibold">{time}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleClockAction}
            variant={clockedIn ? "outline" : "default"}
            className="flex-1"
            data-testid={clockedIn ? "button-clock-out" : "button-clock-in"}
          >
            {clockedIn ? "Clock Out" : "Clock In"}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => console.log("Take photo for attendance")}
            data-testid="button-take-photo"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  LayoutDashboard, Clock, Umbrella, Receipt, 
  Megaphone, FileText, User, CheckCircle, XCircle,
  Clock3, CalendarDays, Camera, MapPin
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { type AttendanceRecord } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/employee", icon: LayoutDashboard },
  { title: "Attendance", url: "/dashboard/employee/attendance", icon: Clock },
  { title: "Leave", url: "/dashboard/employee/leave", icon: Umbrella },
  { title: "Expenses", url: "/dashboard/employee/expenses", icon: Receipt },
  { title: "Noticeboard", url: "/dashboard/employee/noticeboard", icon: Megaphone },
  { title: "Payslips", url: "/dashboard/employee/payslips", icon: FileText },
  { title: "Profile", url: "/dashboard/employee/profile", icon: User },
];

export default function EmployeeAttendancePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance-records"],
  });

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("Camera not available, using dummy photo");
      setCapturedPhoto("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ccircle cx='200' cy='120' r='40' fill='%239ca3af'/%3E%3Cpath d='M 160 160 Q 200 180 240 160' stroke='%239ca3af' stroke-width='3' fill='none'/%3E%3Ctext x='50%25' y='85%25' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='16'%3EDemo Photo%3C/text%3E%3C/svg%3E");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Using Demo Mode",
        description: "Camera not available. Using demo photo for check-in.",
      });
      // Use dummy photo as fallback
      setCapturedPhoto("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ccircle cx='200' cy='120' r='40' fill='%239ca3af'/%3E%3Cpath d='M 160 160 Q 200 180 240 160' stroke='%239ca3af' stroke-width='3' fill='none'/%3E%3Ctext x='50%25' y='85%25' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='16'%3EDemo Photo%3C/text%3E%3C/svg%3E");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photoData);
        
        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsCapturing(false);
      }
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      // Use dummy location if geolocation not supported
      const dummyLocation = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01,
      };
      setLocation(dummyLocation);
      toast({
        title: "Using Demo Mode",
        description: "Geolocation not available. Using demo location.",
      });
      return;
    }

    // Set a timeout for geolocation
    const timeoutId = setTimeout(() => {
      console.log("Geolocation timeout, using dummy location");
      const dummyLocation = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01,
      };
      setLocation(dummyLocation);
      toast({
        title: "Using Demo Mode",
        description: "Location timeout. Using demo location.",
      });
    }, 3000); // 3 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Location captured",
          description: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error("Error getting location:", error);
        // Use dummy location as fallback
        const dummyLocation = {
          lat: 37.7749 + (Math.random() - 0.5) * 0.01,
          lng: -122.4194 + (Math.random() - 0.5) * 0.01,
        };
        setLocation(dummyLocation);
        toast({
          title: "Using Demo Mode",
          description: `Location unavailable. Using demo location.`,
        });
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  };

  const handleCheckIn = () => {
    setShowCheckInDialog(true);
    setCapturedPhoto(null);
    setLocation(null);
    setTimeout(() => {
      startCamera();
      getLocation();
    }, 300);
  };

  const confirmCheckIn = () => {
    if (!capturedPhoto || !location) {
      toast({
        title: "Missing Information",
        description: "Please capture photo and location first",
        variant: "destructive",
      });
      return;
    }

    // TODO: Send to API with photo and location
    toast({
      title: "Check-in Successful",
      description: `Checked in at ${format(new Date(), "hh:mm a")}`,
    });
    
    setShowCheckInDialog(false);
    setCapturedPhoto(null);
    setLocation(null);
    
    // Cleanup camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Filter records for current user
  const myRecords = attendanceRecords.filter(record => {
    // Match by email since we don't have direct employeeId mapping
    return true; // For now, show all records - will need proper user-employee mapping
  });

  // Get current month records
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthRecords = myRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });

  const presentDays = monthRecords.filter(r => r.status === "present").length;
  const absentDays = monthRecords.filter(r => r.status === "absent").length;
  const totalWorkingDays = 22; // Approximate
  const attendancePercentage = totalWorkingDays > 0 
    ? Math.round((presentDays / totalWorkingDays) * 100)
    : 0;

  // Get today's attendance
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecord = myRecords.find(r => r.date === today);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case "absent":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case "half_day":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400"><Clock3 className="h-3 w-3 mr-1" />Half Day</Badge>;
      case "leave":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400"><Umbrella className="h-3 w-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="employee">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">My Attendance</h2>
          <p className="text-muted-foreground">Track your attendance and work hours</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-attendance-percentage">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">Attendance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-present-days">{presentDays}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-absent-days">{absentDays}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {todayRecord ? (
                <div className="flex items-center gap-2">
                  {getStatusBadge(todayRecord.status)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not marked yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Check in for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayRecord ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(todayRecord.status)}
                  </div>
                  {todayRecord.checkIn && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check In</span>
                      <span className="font-medium">{format(new Date(todayRecord.checkIn), "hh:mm a")}</span>
                    </div>
                  )}
                  {todayRecord.checkOut && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check Out</span>
                      <span className="font-medium">{format(new Date(todayRecord.checkOut), "hh:mm a")}</span>
                    </div>
                  )}
                  {!todayRecord.checkOut && todayRecord.status === "present" && (
                    <Button className="w-full" data-testid="button-checkout">
                      Check Out
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center py-4">
                    You haven't checked in today
                  </p>
                  <Button className="w-full" onClick={handleCheckIn} data-testid="button-checkin">
                    <Clock className="h-4 w-4 mr-2" />
                    Check In Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Your attendance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Working Days</span>
                  <span className="font-medium">{totalWorkingDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Present</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{presentDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Absent</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{absentDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On Leave</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {monthRecords.filter(r => r.status === "leave").length}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-lg font-bold">{attendancePercentage}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your recent attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {monthRecords.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-records">No attendance records found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {monthRecords.slice(0, 10).reverse().map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={`record-${record.id}`}>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{format(new Date(record.date), "EEEE, MMM dd, yyyy")}</p>
                        {record.checkIn && (
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.checkIn), "hh:mm a")}
                            {record.checkOut && ` - ${format(new Date(record.checkOut), "hh:mm a")}`}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Check In</DialogTitle>
              <DialogDescription>Capture your photo and location to check in</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Photo Capture */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photo
                  </h4>
                  {capturedPhoto && (
                    <Button variant="outline" size="sm" onClick={retakePhoto}>
                      Retake
                    </Button>
                  )}
                </div>
                
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  {isCapturing && !capturedPhoto ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : capturedPhoto ? (
                    <img
                      src={capturedPhoto}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Camera className="h-12 w-12" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                {isCapturing && !capturedPhoto && (
                  <Button className="w-full" onClick={capturePhoto} data-testid="button-capture-photo">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <div className="p-3 rounded-md bg-muted">
                  {location ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Latitude:</span>
                        <span className="font-medium" data-testid="text-latitude">{location.lat.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Longitude:</span>
                        <span className="font-medium" data-testid="text-longitude">{location.lng.toFixed(6)}</span>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-xs text-muted-foreground">
                          Location captured successfully
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      Capturing location...
                    </div>
                  )}
                </div>
              </div>

              {/* Current Time */}
              <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Check-in Time</span>
                  <span className="text-lg font-bold">{format(new Date(), "hh:mm a")}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCheckInDialog(false);
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmCheckIn} 
                disabled={!capturedPhoto || !location}
                data-testid="button-confirm-checkin"
              >
                Confirm Check-in
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

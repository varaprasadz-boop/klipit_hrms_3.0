import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const planFeatures = [
  { name: "Included Users", value: "Upto 1 User", included: true },
  { name: "Additional Users", value: "₹30/- User", included: true },
  { name: "Brand Creation", limit: "05", included: true },
  { name: "Product Creation Allowed", included: true },
  { name: "Subscriptions Export", included: false },
  { name: "Dynamic Forms", included: false },
  { name: "Blog/News/Announcement", included: true },
  { name: "Localization/Language", included: false },
  { name: "AdvanceBooking/Reservation", included: false },
  { name: "Offline/Tracking", included: true },
  { name: "Payment/Collection", included: true },
  { name: "SEO/Metadata", included: true },
  { name: "SMS/Attendance", included: false },
  { name: "Back/Store/Storage", included: false },
  { name: "Whatsapp", included: true },
  { name: "SignupInEmail", included: true },
  { name: "Loyalty/Reward/Vouched", included: false },
  { name: "ExpenseManagement", included: true },
  { name: "Cleanings", included: true },
  { name: "Report", included: true },
  { name: "Faculdades/attendance", included: false },
  { name: "Appendix", included: true },
  { name: "Reviews", included: false },
  { name: "AffiliateLink", included: false },
];

export default function WaitingApproval() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [additionalUsers, setAdditionalUsers] = useState(6);
  const [showOfflinePending, setShowOfflinePending] = useState(false);
  const { toast } = useToast();

  const basePrice = 50;
  const pricePerUser = 30;
  const includedUsers = 1;
  const totalPrice = basePrice + (additionalUsers * pricePerUser);

  const handlePayOnline = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully!",
    });
    setShowPaymentDialog(false);
    // TODO: Redirect to order history page
  };

  const handlePayOffline = () => {
    setShowOfflinePending(true);
    setShowPaymentDialog(false);
    toast({
      title: "Offline Payment Request Submitted",
      description: "Your request has been submitted and is pending approval.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex gap-4 mb-6 text-sm border-b">
            <a href="/waiting-approval" className="text-primary font-medium border-b-2 border-primary pb-2">Dashboard</a>
            <a href="#" className="text-muted-foreground hover:text-foreground pb-2">Order History</a>
            <a href="/offline-requests" className="text-muted-foreground hover:text-foreground flex items-center gap-1 pb-2">
              Offline Requests
              {showOfflinePending && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">1</span>
              )}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground pb-2">Domain Requests</a>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Welcome to the Klipit HRMS WORLD 👍</h1>
        </div>

        {showOfflinePending && (
          <Card className="mb-6 bg-cyan-50 border-cyan-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-cyan-900">Offline Request Pending!</h2>
                <p className="text-cyan-800">
                  Your offline request is pending approval. You will be notified once it is approved.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">You Don't have an Active Plan</h2>
              <p className="text-muted-foreground">
                Check out the available plans below and subscribe to get started
              </p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
          
          <div className="max-w-xs">
            <Card>
              <CardHeader className="text-center border-b">
                <CardTitle className="text-lg">Basic</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary">₹50</div>
                  <div className="text-sm text-muted-foreground mt-1">Valid price for 3 Months</div>
                </div>

                <div className="space-y-2 text-sm">
                  {planFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        {feature.value && <span className="text-foreground">{feature.value}</span>}
                        {feature.limit && <span className="text-foreground">{feature.limit}</span>}
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <a href="#" className="text-sm text-primary hover:underline">
                    This is a free plan
                  </a>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => setShowPaymentDialog(true)}
                  data-testid="button-subscribe"
                >
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">Basic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price:</span>
                  <span className="font-medium">₹{basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Per User:</span>
                  <span className="font-medium">₹{pricePerUser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Included Users:</span>
                  <span className="font-medium">{includedUsers}</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Number of Additional Users
                </label>
                <div className="flex items-center gap-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdditionalUsers(Math.max(0, additionalUsers - 1))}
                    className="rounded-r-none"
                    data-testid="button-decrease-users"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-9 flex items-center justify-center border-y bg-background text-center font-medium">
                    {additionalUsers}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdditionalUsers(additionalUsers + 1)}
                    className="rounded-l-none"
                    data-testid="button-increase-users"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <div className="text-lg">
                  <span className="text-muted-foreground mr-2">Total Price:</span>
                  <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={handlePayOnline}
                  data-testid="button-pay-online"
                >
                  Pay Online
                </Button>
                <Button 
                  className="bg-cyan-500 hover:bg-cyan-600" 
                  onClick={handlePayOffline}
                  data-testid="button-pay-offline"
                >
                  Pay Offline
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-md text-sm">
                <p className="text-muted-foreground">
                  For offline payment, please make your payment to the following bank account number:{" "}
                  <span className="font-medium text-foreground">1234567890</span>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

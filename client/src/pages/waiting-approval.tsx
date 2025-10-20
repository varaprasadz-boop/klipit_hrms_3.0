import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex gap-4 mb-6 text-sm">
            <a href="#" className="text-primary font-medium">Dashboard</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Order History</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Offline Requests</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Domain Requests</a>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Welcome to the Klipit HRMS WORLD 👍</h1>
        </div>

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
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-subscribe">
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

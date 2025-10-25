import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PayrollRecord, PayrollItem } from "@shared/schema";

export default function PayslipsList() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Fetch published payroll records for the logged-in employee
  const { data: payrollRecords = [], isLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll"],
  });
  
  // Filter for published payslips only (status approved and payslipPublished = true)
  const publishedPayslips = payrollRecords.filter(
    record => record.payslipPublished && record.status === "approved" && record.employeeId === user.id
  ).sort((a, b) => {
    // Sort by year desc, then month desc
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  // Helper to get month/year display
  const getMonthYear = (month: number, year: number) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    return `${monthNames[month - 1]} ${year}`;
  };
  
  // Fetch payroll items when a payslip is selected
  const handleViewPayslip = async (payslip: PayrollRecord) => {
    setSelectedPayslip(payslip);
    setLoadingItems(true);
    
    try {
      const response = await fetch(`/api/payroll/${payslip.id}/items`);
      if (response.ok) {
        const items = await response.json();
        setPayrollItems(items);
      }
    } catch (error) {
      console.error("Failed to fetch payroll items:", error);
      setPayrollItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Payslips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </>
          ) : publishedPayslips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payslips available yet
            </div>
          ) : (
            publishedPayslips.map((payslip) => (
              <Card key={payslip.id} className="p-3 hover-elevate" data-testid={`card-payslip-${payslip.id}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-month-${payslip.id}`}>
                      {getMonthYear(payslip.month, payslip.year)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`text-net-${payslip.id}`}>
                      Net: ₹{payslip.netPay.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="default" data-testid={`badge-status-${payslip.id}`}>Published</Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPayslip(payslip)}
                      data-testid={`button-view-${payslip.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => console.log("Download payslip:", payslip.id)}
                      data-testid={`button-download-${payslip.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayslip} onOpenChange={(open) => !open && setSelectedPayslip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Payslip - {selectedPayslip && getMonthYear(selectedPayslip.month, selectedPayslip.year)}
            </DialogTitle>
            <DialogDescription>Salary breakdown and deductions</DialogDescription>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Working Days</span>
                <span className="font-medium">{selectedPayslip.workingDays}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Present Days</span>
                <span className="font-medium">{selectedPayslip.presentDays}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Gross Salary</span>
                <span className="font-medium">₹{selectedPayslip.grossPay.toLocaleString()}</span>
              </div>
              
              {loadingItems ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  {payrollItems.filter(item => item.type === "deduction").map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-destructive">- ₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}
              
              <div className="flex justify-between py-2 pt-2 border-t-2">
                <span className="font-semibold">Net Salary</span>
                <span className="font-bold text-primary">₹{selectedPayslip.netPay.toLocaleString()}</span>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={() => console.log("Download", selectedPayslip.id)}
                data-testid="button-download-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Payslip
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

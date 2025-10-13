import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// todo: remove mock functionality
const mockPayslips = [
  { id: 1, month: "January 2024", gross: "₹50,000", net: "₹45,000", status: "Paid" },
  { id: 2, month: "December 2023", gross: "₹50,000", net: "₹45,000", status: "Paid" },
  { id: 3, month: "November 2023", gross: "₹48,000", net: "₹43,200", status: "Paid" },
];

export default function PayslipsList() {
  const [selectedPayslip, setSelectedPayslip] = useState<typeof mockPayslips[0] | null>(null);

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
          {mockPayslips.map((payslip) => (
            <Card key={payslip.id} className="p-3 hover-elevate">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{payslip.month}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Net: {payslip.net}
                  </p>
                </div>
                <Badge variant="default">{payslip.status}</Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPayslip(payslip)}
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
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayslip} onOpenChange={(open) => !open && setSelectedPayslip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payslip - {selectedPayslip?.month}</DialogTitle>
            <DialogDescription>Salary breakdown and deductions</DialogDescription>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Gross Salary</span>
                <span className="font-medium">{selectedPayslip.gross}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Tax Deduction</span>
                <span className="font-medium text-destructive">- ₹3,000</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">PF Deduction</span>
                <span className="font-medium text-destructive">- ₹2,000</span>
              </div>
              <div className="flex justify-between py-2 pt-2 border-t-2">
                <span className="font-semibold">Net Salary</span>
                <span className="font-bold text-primary">{selectedPayslip.net}</span>
              </div>
              <Button className="w-full mt-4" onClick={() => console.log("Download")}>
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

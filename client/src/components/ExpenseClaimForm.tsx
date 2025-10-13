import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExpenseClaimForm() {
  const { toast } = useToast();
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Expense claim submitted",
      description: "Your claim has been sent for approval.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Submit Expense Claim
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="expense-category" data-testid="select-expense-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="supplies">Office Supplies</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              data-testid="input-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              data-testid="input-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter expense details"
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Upload</Label>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => console.log("Upload receipt")}
              data-testid="button-upload-receipt"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Receipt
            </Button>
          </div>

          <Button type="submit" className="w-full" data-testid="button-submit-claim">
            Submit Claim
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

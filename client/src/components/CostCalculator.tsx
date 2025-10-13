import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Users } from "lucide-react";

export default function CostCalculator() {
  const [employees, setEmployees] = useState<string>("");
  const [result, setResult] = useState<{
    count: number;
    perEmployee: number;
    total: number;
    showContact: boolean;
  } | null>(null);

  const calculateCost = () => {
    const count = parseInt(employees) || 0;
    const actualCount = Math.max(count, 10);
    
    if (actualCount >= 100) {
      setResult({
        count: actualCount,
        perEmployee: 0,
        total: 0,
        showContact: true
      });
    } else {
      let perEmployee = 275;
      if (actualCount > 10 && actualCount <= 25) perEmployee = 225;
      else if (actualCount > 25 && actualCount <= 50) perEmployee = 200;
      else if (actualCount > 50 && actualCount < 100) perEmployee = 150;
      
      setResult({
        count: actualCount,
        perEmployee,
        total: perEmployee * actualCount * 12,
        showContact: false
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Cost Calculator</CardTitle>
        </div>
        <CardDescription>
          Estimate your annual subscription cost (minimum 10 employees)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="employees" className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Number of Employees
          </label>
          <Input
            id="employees"
            type="number"
            min="1"
            placeholder="Enter number of employees"
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            data-testid="input-employees"
          />
        </div>

        <Button 
          onClick={calculateCost} 
          className="w-full"
          data-testid="button-calculate"
        >
          Calculate Cost
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-primary/10 rounded-md space-y-3">
            {result.showContact ? (
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold">
                  For {result.count}+ employees
                </p>
                <p className="text-muted-foreground">
                  Contact our Sales Team for customized corporate offers
                </p>
                <Button variant="default" className="w-full" data-testid="button-contact-sales">
                  Contact Sales Team
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Employees:</span>
                  <span className="font-semibold">{result.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cost per employee/month:</span>
                  <span className="font-semibold">₹{result.perEmployee}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total Annual Cost:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{result.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="default" className="flex-1" data-testid="button-get-quote">
                    Get a Quote
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="button-request-demo">
                    Request Demo
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

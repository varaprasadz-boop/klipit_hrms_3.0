import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, CheckCircle2, CreditCard, Building, Users, Wallet, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";

const STEPS = ["Company Info", "Select Plan", "Employee Count", "Payment", "Complete"];

type StepNumber = 1 | 2 | 3 | 4 | 5;

export default function RegisterCompany() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "offline" | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number>(1);
  
  const [step1Data, setStep1Data] = useState({
    companyName: "",
    adminFirstName: "",
    adminLastName: "",
    phone: "",
    gender: "male",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [offlineNotes, setOfflineNotes] = useState("");
  const [duplicateFields, setDuplicateFields] = useState<string[]>([]);

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Calculate total monthly cost based on employee count
  const calculateTotalCost = (plan: typeof selectedPlan, empCount: number): number => {
    if (!plan) return 0;
    
    const basePrice = plan.price || 0;
    const includedEmployees = plan.employeesIncluded || 0;
    const pricePerAdditional = plan.pricePerAdditionalEmployee || 0;
    
    if (empCount <= includedEmployees) {
      return basePrice;
    }
    
    const additionalEmployees = empCount - includedEmployees;
    return basePrice + (additionalEmployees * pricePerAdditional);
  };

  const totalCost = calculateTotalCost(selectedPlan, employeeCount);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step1Data.password !== step1Data.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the privacy policy & terms",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = step1Data;
      
      // Use raw fetch instead of apiRequest so we can handle error responses properly
      const response = await fetch("/api/registration/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if there's a duplicate field error
        if (data.duplicateField) {
          console.log("[Registration] Duplicate field detected:", data.duplicateField);
          setDuplicateFields([data.duplicateField]);
          toast({
            title: "Duplicate data detected",
            description: data.error || "Please change the highlighted field and try again",
            variant: "destructive",
          });
        } else {
          console.log("[Registration] Error:", data.error);
          setDuplicateFields([]);
          toast({
            title: "Registration failed",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      setDuplicateFields([]);
      setSessionId(data.sessionId);
      setCurrentStep(2);
      toast({
        title: "Step 1 Complete",
        description: "Please select a subscription plan",
      });
    } catch (error: any) {
      console.log("[Registration] Exception:", error);
      setDuplicateFields([]);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Plan required",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("POST", `/api/registration/${sessionId}/select-plan`, {
        planId: selectedPlanId,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to select plan");
      }

      setCurrentStep(3);
      toast({
        title: "Plan selected",
        description: "You can now add employees or proceed to payment",
      });
    } catch (error: any) {
      toast({
        title: "Failed to select plan",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSkipEmployees = async () => {
    setLoading(true);

    try {
      const response = await apiRequest("POST", `/api/registration/${sessionId}/add-employees`, {
        employees: [],
        employeeCount,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to proceed");
      }

      setCurrentStep(4);
      toast({
        title: "Employee count saved",
        description: "Please choose a payment method",
      });
    } catch (error: any) {
      toast({
        title: "Failed to proceed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    console.log("Card data:", cardData);
    
    if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv) {
      console.log("Validation failed:", {
        hasCardNumber: !!cardData.cardNumber,
        hasMonth: !!cardData.expiryMonth,
        hasYear: !!cardData.expiryYear,
        hasCVV: !!cardData.cvv,
      });
      toast({
        title: "Card details required",
        description: "Please enter all card details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("POST", `/api/registration/${sessionId}/pay-online`, cardData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      login(data.user, data.token);
      setCurrentStep(5);
      toast({
        title: "Payment successful",
        description: "Your registration is complete. Awaiting admin approval.",
      });
      
      setTimeout(() => {
        setLocation("/waiting-approval");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfflinePayment = async () => {
    setLoading(true);

    try {
      const response = await apiRequest("POST", `/api/registration/${sessionId}/pay-offline`, {
        notes: offlineNotes,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      login(data.user, data.token);
      setCurrentStep(5);
      toast({
        title: "Request submitted",
        description: "Your offline payment request has been sent. Awaiting admin approval.",
      });
      
      setTimeout(() => {
        setLocation("/waiting-approval");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Klipit by Bova 🚀
          </h1>
          <p className="text-muted-foreground">
            Complete the registration process to get started
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep > index + 1
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === index + 1
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    }`}
                    data-testid={`step-indicator-${index + 1}`}
                  >
                    {currentStep > index + 1 ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= index + 1 ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > index + 1 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1]}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your company and admin details"}
              {currentStep === 2 && "Choose a subscription plan that suits your needs"}
              {currentStep === 3 && "Add employees to your organization (optional)"}
              {currentStep === 4 && "Complete payment to activate your account"}
              {currentStep === 5 && "Registration complete!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter your company name"
                    value={step1Data.companyName}
                    onChange={(e) => setStep1Data({ ...step1Data, companyName: e.target.value })}
                    required
                    data-testid="input-company-name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name</Label>
                    <Input
                      id="adminFirstName"
                      placeholder="Enter your first name"
                      value={step1Data.adminFirstName}
                      onChange={(e) => setStep1Data({ ...step1Data, adminFirstName: e.target.value })}
                      required
                      data-testid="input-first-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name</Label>
                    <Input
                      id="adminLastName"
                      placeholder="Enter your last name"
                      value={step1Data.adminLastName}
                      onChange={(e) => setStep1Data({ ...step1Data, adminLastName: e.target.value })}
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={duplicateFields.includes("phone") ? "text-destructive" : ""}>
                      Phone Number {duplicateFields.includes("phone") && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={step1Data.phone}
                      onChange={(e) => {
                        setStep1Data({ ...step1Data, phone: e.target.value });
                        setDuplicateFields(duplicateFields.filter(f => f !== "phone"));
                      }}
                      required
                      className={duplicateFields.includes("phone") ? "border-destructive focus-visible:ring-destructive" : ""}
                      data-testid="input-phone"
                      aria-invalid={duplicateFields.includes("phone")}
                      aria-describedby={duplicateFields.includes("phone") ? "phone-error" : undefined}
                    />
                    {duplicateFields.includes("phone") && (
                      <p id="phone-error" className="text-sm text-destructive" data-testid="error-phone">
                        This phone number is already registered
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={step1Data.gender}
                      onValueChange={(value) => setStep1Data({ ...step1Data, gender: value })}
                    >
                      <SelectTrigger id="gender" data-testid="select-gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={duplicateFields.includes("email") ? "text-destructive" : ""}>
                    Email {duplicateFields.includes("email") && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={step1Data.email}
                    onChange={(e) => {
                      setStep1Data({ ...step1Data, email: e.target.value });
                      setDuplicateFields(duplicateFields.filter(f => f !== "email"));
                    }}
                    required
                    className={duplicateFields.includes("email") ? "border-destructive focus-visible:ring-destructive" : ""}
                    data-testid="input-email"
                    aria-invalid={duplicateFields.includes("email")}
                    aria-describedby={duplicateFields.includes("email") ? "email-error" : undefined}
                  />
                  {duplicateFields.includes("email") && (
                    <p id="email-error" className="text-sm text-destructive" data-testid="error-email">
                      This email is already registered
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="··········"
                        value={step1Data.password}
                        onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                        required
                        minLength={6}
                        className="pr-10"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="··········"
                        value={step1Data.confirmPassword}
                        onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                        className="pr-10"
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    data-testid="checkbox-terms"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy policy & terms
                    </a>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/login/company")}
                    data-testid="button-back-to-login"
                  >
                    Back to Login
                  </Button>
                  <Button type="submit" disabled={loading} data-testid="button-next-step-1">
                    {loading ? "Processing..." : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Plan Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plansLoading ? (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      Loading plans...
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          selectedPlanId === plan.id
                            ? "border-primary ring-2 ring-primary"
                            : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPlanId(plan.id)}
                        data-testid={`plan-card-${plan.id}`}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {plan.displayName}
                            {selectedPlanId === plan.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </CardTitle>
                          <CardDescription className="space-y-1">
                            <div>
                              <span className="text-2xl font-bold text-foreground">₹{plan.price}</span>
                              <span className="text-sm">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Includes up to {plan.employeesIncluded} employees
                            </p>
                            {plan.pricePerAdditionalEmployee > 0 && (
                              <p className="text-sm text-muted-foreground">
                                +₹{plan.pricePerAdditionalEmployee} per additional employee
                              </p>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Array.isArray(plan.features) && plan.features.length > 0 && (
                              <ul className="text-sm space-y-1">
                                {plan.features.map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={loading}
                    data-testid="button-back-step-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleStep2Submit}
                    disabled={loading || !selectedPlanId}
                    data-testid="button-next-step-2"
                  >
                    {loading ? "Processing..." : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Employee Count */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>How many employees do you plan to have?</CardTitle>
                    <CardDescription>
                      Enter the number of employees who will use the system. You can add employee details after registration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="employee-count">Number of Employees</Label>
                      <Input
                        id="employee-count"
                        type="number"
                        min="1"
                        max={selectedPlan?.maxEmployees || 1}
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                        data-testid="input-employee-count"
                      />
                      {selectedPlan && (
                        <p className="text-sm text-muted-foreground">
                          Your selected plan ({selectedPlan.displayName}) supports up to {selectedPlan.maxEmployees} employees.
                        </p>
                      )}
                      {employeeCount > (selectedPlan?.maxEmployees || 0) && (
                        <p className="text-sm text-destructive">
                          Employee count exceeds plan limit. Please select a different plan or reduce the count.
                        </p>
                      )}
                    </div>

                    {selectedPlan && (
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold">Pricing Summary</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Selected Plan:</span>
                          <span className="font-medium">{selectedPlan.displayName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Employee Count:</span>
                          <span className="font-medium">{employeeCount}</span>
                        </div>
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Base Price ({selectedPlan.employeesIncluded} employees):</span>
                            <span className="font-medium">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                          </div>
                          {employeeCount > selectedPlan.employeesIncluded && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Additional Employees ({employeeCount - selectedPlan.employeesIncluded} × ₹{selectedPlan.pricePerAdditionalEmployee}):
                              </span>
                              <span className="font-medium">
                                ₹{((employeeCount - selectedPlan.employeesIncluded) * selectedPlan.pricePerAdditionalEmployee).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="font-semibold">Total Monthly Cost:</span>
                          <span className="text-2xl font-bold text-primary">
                            ₹{totalCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {employeeCount <= selectedPlan.employeesIncluded 
                            ? `Includes up to ${selectedPlan.employeesIncluded} employees` 
                            : `${selectedPlan.employeesIncluded} included + ${employeeCount - selectedPlan.employeesIncluded} additional`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    disabled={loading}
                    data-testid="button-back-step-3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSkipEmployees}
                    disabled={loading || employeeCount > (selectedPlan?.maxEmployees || 0)}
                    data-testid="button-next-step-3"
                  >
                    {loading ? "Processing..." : "Proceed to Payment"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {!paymentMethod ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                      {selectedPlan && (
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{selectedPlan.displayName}</span>
                            <span className="font-semibold">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Number of Employees:</span>
                            <span className="font-medium">{employeeCount}</span>
                          </div>
                          {employeeCount > selectedPlan.employeesIncluded && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Additional Employees ({employeeCount - selectedPlan.employeesIncluded}):
                              </span>
                              <span className="font-medium">
                                ₹{((employeeCount - selectedPlan.employeesIncluded) * selectedPlan.pricePerAdditionalEmployee).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t">
                            <span className="font-semibold">Total Amount:</span>
                            <span className="text-2xl font-bold text-primary">₹{totalCost.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPlan.duration} month{selectedPlan.duration > 1 ? 's' : ''} subscription
                          </p>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card
                        className="cursor-pointer hover-elevate"
                        onClick={() => setPaymentMethod("online")}
                        data-testid="card-payment-online"
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <CreditCard className="h-12 w-12 text-primary" />
                            <h4 className="font-semibold">Pay Online</h4>
                            <p className="text-sm text-muted-foreground">
                              Complete payment with debit/credit card
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className="cursor-pointer hover-elevate"
                        onClick={() => setPaymentMethod("offline")}
                        data-testid="card-payment-offline"
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <Wallet className="h-12 w-12 text-primary" />
                            <h4 className="font-semibold">Offline Payment</h4>
                            <p className="text-sm text-muted-foreground">
                              Request offline payment approval
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : paymentMethod === "online" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Card Details</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPaymentMethod(null)}
                        data-testid="button-change-payment-method"
                      >
                        Change Method
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        maxLength={19}
                        data-testid="input-card-number"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">Month</Label>
                        <Select
                          value={cardData.expiryMonth}
                          onValueChange={(value) => setCardData({ ...cardData, expiryMonth: value })}
                        >
                          <SelectTrigger id="expiryMonth" data-testid="select-expiry-month">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = (i + 1).toString().padStart(2, "0");
                              return (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">Year</Label>
                        <Select
                          value={cardData.expiryYear}
                          onValueChange={(value) => setCardData({ ...cardData, expiryYear: value })}
                        >
                          <SelectTrigger id="expiryYear" data-testid="select-expiry-year">
                            <SelectValue placeholder="YY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = (new Date().getFullYear() + i).toString().slice(-2);
                              return (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          maxLength={4}
                          data-testid="input-cvv"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleOnlinePayment}
                      disabled={loading}
                      className="w-full"
                      data-testid="button-complete-payment"
                    >
                      {loading ? "Processing..." : `Pay ₹${selectedPlan?.price}`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Offline Payment Request</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPaymentMethod(null)}
                        data-testid="button-change-payment-method"
                      >
                        Change Method
                      </Button>
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm">
                        You have chosen offline payment. Our team will contact you regarding payment instructions.
                      </p>
                      <p className="text-sm font-medium">
                        Amount: ₹{selectedPlan?.price}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="offlineNotes">Notes (optional)</Label>
                      <Textarea
                        id="offlineNotes"
                        placeholder="Add any additional notes or payment references..."
                        value={offlineNotes}
                        onChange={(e) => setOfflineNotes(e.target.value)}
                        rows={4}
                        data-testid="textarea-offline-notes"
                      />
                    </div>

                    <Button
                      onClick={handleOfflinePayment}
                      disabled={loading}
                      className="w-full"
                      data-testid="button-submit-offline-request"
                    >
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                )}

                {!paymentMethod && (
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      disabled={loading}
                      data-testid="button-back-step-4"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 5 && (
              <div className="text-center py-8 space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
                  <p className="text-muted-foreground">
                    Your registration is being processed. You will be redirected shortly.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span>Already have an account? </span>
          <a
            href="/login/company"
            className="text-primary hover:underline font-medium"
            data-testid="link-login"
          >
            Log in instead
          </a>
        </div>
      </div>
    </div>
  );
}

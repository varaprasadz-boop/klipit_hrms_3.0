import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserPlus, CheckCircle2 } from "lucide-react";

// todo: remove mock functionality
const onboardingSteps = [
  { id: 1, title: "Personal Information", completed: true },
  { id: 2, title: "Document Upload", completed: true },
  { id: 3, title: "Bank Details", completed: true },
  { id: 4, title: "IT Declaration", completed: false },
  { id: 5, title: "Training Modules", completed: false },
];

export default function LifecycleProgress() {
  const completed = onboardingSteps.filter(s => s.completed).length;
  const progress = (completed / onboardingSteps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Onboarding Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{completed}/{onboardingSteps.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {onboardingSteps.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-2 rounded-md hover-elevate"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 
                  className={`h-4 w-4 ${step.completed ? 'text-primary' : 'text-muted-foreground'}`} 
                />
                <span className={`text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
              <Badge variant={step.completed ? "default" : "secondary"}>
                {step.completed ? "Done" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

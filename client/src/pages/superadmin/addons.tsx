import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

const addons = [
  {
    name: "Advanced Analytics",
    description: "Comprehensive reports and data visualization",
    price: "$49/month",
    active: true,
    subscribers: 24,
  },
  {
    name: "Custom Workflows",
    description: "Build custom approval workflows",
    price: "$79/month",
    active: true,
    subscribers: 12,
  },
  {
    name: "API Access",
    description: "Full API integration capabilities",
    price: "$99/month",
    active: true,
    subscribers: 8,
  },
  {
    name: "Mobile App",
    description: "iOS and Android mobile applications",
    price: "$39/month",
    active: false,
    subscribers: 0,
  },
];

export default function AddonsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Add-ons</h2>
          <p className="text-muted-foreground">Manage optional features and add-ons</p>
        </div>
        <Button data-testid="button-create-addon">
          <Plus className="mr-2 h-4 w-4" />
          Create Add-on
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addons.map((addon) => (
          <Card key={addon.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{addon.name}</CardTitle>
                  <CardDescription className="mt-1">{addon.description}</CardDescription>
                </div>
                <Switch checked={addon.active} data-testid={`switch-${addon.name.toLowerCase().replace(/\s+/g, '-')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">{addon.price}</span>
                </div>
                <Badge variant="secondary">{addon.subscribers} subscribers</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" data-testid={`button-edit-${addon.name.toLowerCase().replace(/\s+/g, '-')}`}>
                Edit Add-on
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

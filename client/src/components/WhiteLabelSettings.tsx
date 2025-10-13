import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Paintbrush, Upload, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WhiteLabelSettings() {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState("#00C853");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your white-label customization has been applied.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" />
            Brand Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => console.log("Upload logo")}
                data-testid="button-upload-logo"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-color">Primary Theme Color</Label>
            <div className="flex gap-2">
              <Input
                id="theme-color"
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-20 h-10"
                data-testid="input-theme-color"
              />
              <Input
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                placeholder="#00C853"
                className="flex-1"
                data-testid="input-theme-hex"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {["#00C853", "#00E676", "#1DE9B6", "#00BFA5"].map(color => (
              <button
                key={color}
                className="h-10 rounded-md border-2"
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                data-testid={`button-color-${color}`}
              />
            ))}
          </div>

          <Button onClick={handleSave} className="w-full" data-testid="button-save-settings">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Mobile App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download our mobile app for Android and iOS
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" data-testid="button-android">
              <span className="text-xs">Get on Android</span>
            </Button>
            <Button variant="outline" data-testid="button-ios">
              <span className="text-xs">Get on iOS</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

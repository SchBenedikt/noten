
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Check } from "lucide-react";

// Material Design Farben
const themes = [
  {
    id: "default",
    name: "Indigo",
    colors: ["#F5F7FF", "#3F51B5", "#303F9F"]
  },
  {
    id: "purple",
    name: "Purple",
    colors: ["#F3E5F5", "#9C27B0", "#7B1FA2"]
  },
  {
    id: "teal",
    name: "Teal",
    colors: ["#E0F2F1", "#009688", "#00796B"]
  },
  {
    id: "orange",
    name: "Deep Orange",
    colors: ["#FBE9E7", "#FF5722", "#E64A19"]
  },
  {
    id: "pink",
    name: "Pink",
    colors: ["#FCE4EC", "#E91E63", "#C2185B"]
  }
];

interface ThemeSettingsProps {
  onClose?: () => void;
}

const ThemeSettings = ({ onClose }: ThemeSettingsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Design-Einstellungen</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium mb-3">Material Design Farbschema</h3>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as any)}
            className="grid grid-cols-1 gap-4"
          >
            {themes.map((themeOption) => (
              <label
                key={themeOption.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:bg-accent ${
                  theme === themeOption.id ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {themeOption.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div>{themeOption.name}</div>
                </div>
                <RadioGroupItem value={themeOption.id} id={themeOption.id} className="sr-only" />
                {theme === themeOption.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;

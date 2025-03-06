
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Palette, Check } from "lucide-react";

const themes = [
  {
    id: "default",
    name: "Standard",
    colors: ["#0f172a", "#f8fafc", "#3b82f6"]
  },
  {
    id: "purple",
    name: "Lila",
    colors: ["#4c1d95", "#f5f3ff", "#8b5cf6"]
  },
  {
    id: "teal",
    name: "Türkis",
    colors: ["#134e4a", "#f0fdfa", "#14b8a6"]
  },
  {
    id: "orange",
    name: "Orange",
    colors: ["#7c2d12", "#fff7ed", "#f97316"]
  },
  {
    id: "pink",
    name: "Rosa",
    colors: ["#831843", "#fdf2f8", "#ec4899"]
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
          <h3 className="text-md font-medium mb-3">Farbschema</h3>
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

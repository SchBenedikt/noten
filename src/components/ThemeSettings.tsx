
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Check, Sparkles, Paintbrush, ColorPicker, PaintBucket } from "lucide-react";

// Material Design Farben mit Emoji-Indikatoren
const themes = [
  {
    id: "default",
    name: "Indigo",
    emoji: "🔷",
    description: "Modern und freundlich",
    colors: ["#F5F7FF", "#3F51B5", "#303F9F"]
  },
  {
    id: "purple",
    name: "Purple",
    emoji: "💜",
    description: "Kreativ und inspirierend",
    colors: ["#F3E5F5", "#9C27B0", "#7B1FA2"]
  },
  {
    id: "teal",
    name: "Teal",
    emoji: "🧠",
    description: "Ruhig und fokussiert",
    colors: ["#E0F2F1", "#009688", "#00796B"]
  },
  {
    id: "orange",
    name: "Deep Orange",
    emoji: "🔥",
    description: "Energisch und lebhaft",
    colors: ["#FBE9E7", "#FF5722", "#E64A19"]
  },
  {
    id: "pink",
    name: "Pink",
    emoji: "🌸",
    description: "Fröhlich und dynamisch",
    colors: ["#FCE4EC", "#E91E63", "#C2185B"]
  }
];

interface ThemeSettingsProps {
  onClose?: () => void;
}

const ThemeSettings = ({ onClose }: ThemeSettingsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Design-Einstellungen ✨</h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center mb-3">
            <ColorPicker className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-md font-medium">Material Design Farbschema</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="px-3 py-1 bg-accent rounded-full text-xs flex items-center">
              <Paintbrush className="h-3 w-3 mr-1" />
              Material Design
            </div>
            <div className="px-3 py-1 bg-accent rounded-full text-xs flex items-center">
              <PaintBucket className="h-3 w-3 mr-1" />
              Android Palette
            </div>
            <div className="px-3 py-1 bg-accent rounded-full text-xs flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Modern UI
            </div>
          </div>
          
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as any)}
            className="grid grid-cols-1 gap-4"
          >
            {themes.map((themeOption) => (
              <label
                key={themeOption.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:bg-accent ${
                  theme === themeOption.id ? "border-primary shadow-md" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {themeOption.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="mr-2">{themeOption.emoji}</span>
                      <span>{themeOption.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{themeOption.description}</span>
                  </div>
                </div>
                <RadioGroupItem value={themeOption.id} id={themeOption.id} className="sr-only" />
                {theme === themeOption.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </label>
            ))}
          </RadioGroup>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-center">
            <div className="text-xs text-center text-muted-foreground flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Wähle ein Theme, das deinen Lernstil widerspiegelt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;

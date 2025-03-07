
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Check, Sparkles, PaintBucket } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Material Design colors with expanded color palette for better visualization
const themes = [
  {
    id: "default",
    name: "Indigo",
    emoji: "💙",
    colors: ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E"],
    description: "Klassisches Blau-Violett",
  },
  {
    id: "purple",
    name: "Purple",
    emoji: "💜",
    colors: ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "#AB47BC", "#9C27B0", "#8E24AA", "#7B1FA2", "#6A1B9A", "#4A148C"],
    description: "Elegantes Lila",
  },
  {
    id: "teal",
    name: "Teal",
    emoji: "💚",
    colors: ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#26A69A", "#009688", "#00897B", "#00796B", "#00695C", "#004D40"],
    description: "Beruhigendes Türkis",
  },
  {
    id: "orange",
    name: "Deep Orange",
    emoji: "🧡",
    colors: ["#FBE9E7", "#FFCCBC", "#FFAB91", "#FF8A65", "#FF7043", "#FF5722", "#F4511E", "#E64A19", "#D84315", "#BF360C"],
    description: "Dynamisches Orange",
  },
  {
    id: "pink",
    name: "Pink",
    emoji: "💖",
    colors: ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#EC407A", "#E91E63", "#D81B60", "#C2185B", "#AD1457", "#880E4F"],
    description: "Lebendiges Rosa",
  }
];

interface ThemeSettingsProps {
  onClose?: () => void;
}

const ThemeSettings = ({ onClose }: ThemeSettingsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Design-Einstellungen</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-150px)] pr-4">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PaintBucket className="h-4 w-4 text-primary" />
              <h3 className="text-md font-medium">Material Design Farbschema</h3>
            </div>
            
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as any)}
              className="grid grid-cols-1 gap-4"
            >
              {themes.map((themeOption) => (
                <label
                  key={themeOption.id}
                  className={`flex flex-col p-4 rounded-lg border transition-all hover:bg-accent cursor-pointer ${
                    theme === themeOption.id ? "border-primary shadow-md" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{themeOption.emoji}</span>
                      <div className="font-medium">{themeOption.name}</div>
                    </div>
                    <RadioGroupItem value={themeOption.id} id={themeOption.id} className="sr-only" />
                    {theme === themeOption.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">{themeOption.description}</div>
                  
                  {/* Color palette display - as a gradient first */}
                  <div 
                    className="h-4 w-full rounded mb-2"
                    style={{ 
                      background: `linear-gradient(to right, ${themeOption.colors.join(', ')})` 
                    }}
                  />
                  
                  {/* Color swatches display */}
                  <div className="flex flex-wrap gap-1">
                    {themeOption.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: color,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
                        }}
                        title={`Shade ${index + 1}`}
                      />
                    ))}
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </ScrollArea>
      
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-center text-muted-foreground">
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="text-sm">Material Design Theme Engine</span>
      </div>
    </div>
  );
};

export default ThemeSettings;

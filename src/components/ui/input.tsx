import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [value, setValue] = React.useState("");

    const handleClear = () => {
      setValue("");
      if (props.onChange) {
        props.onChange({ target: { value: "" } });
      }
    };

    return (
      <div className="relative flex items-center">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
        {value && (
          <button
            type="button"
            className="absolute right-2 text-muted-foreground"
            onClick={handleClear}
          >
            x
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

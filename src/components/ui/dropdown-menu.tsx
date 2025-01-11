import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    style={{
      backgroundColor: "white",
      border: "1px solid lightgray",
      borderRadius: "4px",
      padding: "8px",
      minWidth: "150px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    }}
    {...props}
  />
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    style={{
      padding: "8px",
      cursor: "pointer",
      borderRadius: "4px",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    style={{
      height: "1px",
      backgroundColor: "lightgray",
      margin: "4px 0",
    }}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};

import * as React from "react";

import { Switch as SwitchPrimitive } from "@radix-ui/react-switch";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive>
>(({ checked, ...props }, ref) => (
  <SwitchPrimitive
    checked={checked}
    className="relative bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-primary rounded-full w-9 h-5 transition-colors duration-300 ease-in-out"
    {...props}
    ref={ref}
  >
    <span 
      className="block bg-white shadow-sm rounded-full w-4 h-4 transform transition-transform duration-300 ease-in-out"
      style={{
        transform: checked ? 'translateX(16px)' : 'translateX(2px)'
      }}
    />
  </SwitchPrimitive>
));

Switch.displayName = "Switch";

export { Switch }; 
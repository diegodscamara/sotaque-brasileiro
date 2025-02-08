import * as React from "react";

import { Switch as SwitchPrimitive } from "@radix-ui/react-switch";

/**
 * A customizable switch component with accessibility features.
 * @param {boolean} checked - The checked state of the switch
 * @param {React.ComponentPropsWithoutRef<typeof SwitchPrimitive>} props - Additional props
 * @param {React.Ref<HTMLButtonElement>} ref - Forwarded ref
 * @returns {JSX.Element} A fully accessible switch component
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive>
>(({ checked, ...props }, ref) => (
  <SwitchPrimitive
    checked={checked}
    className="relative bg-gray-200 dark:bg-gray-600 dark:data-[state=checked]:bg-primary data-[state=checked]:bg-primary rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-9 h-5 transition-colors duration-300 ease-in-out"
    role="switch"
    aria-checked={checked}
    aria-label={props['aria-label'] || 'Toggle switch'}
    {...props}
    ref={ref}
  >
    <span 
      className="block bg-white shadow-sm rounded-full w-4 h-4 transform transition-transform duration-300 ease-in-out"
      style={{
        transform: checked ? 'translateX(18px)' : 'translateX(2px)'
      }}
      aria-hidden="true"
    />
  </SwitchPrimitive>
));

Switch.displayName = "Switch";

export { Switch }; 
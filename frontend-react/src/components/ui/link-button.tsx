import React, { ReactNode } from "react";
import { Button } from "./button";

interface LinkButtonProps extends React.ComponentProps<typeof Button> {
  children: ReactNode;
  asChild?: boolean;
}

function LinkButton({ children, asChild, ...props }: LinkButtonProps) {
  return (
    <Button {...props} variant="default" asChild={asChild}>
      {children}
    </Button>
  );
}

export default LinkButton;

// Example usage:
// import { Link } from "react-router-dom";
//
// <LinkButton>
//   <Link to="/dashboard">Go to Dashboard</Link>
// </LinkButton>
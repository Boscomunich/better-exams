import React from "react";
import { ColorTokens } from "tamagui";
import { Button, ButtonProps, Spinner } from "tamagui";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  spinnerColor?: ColorTokens;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement | any,
  LoadingButtonProps
>(
  (
    {
      loading,
      loadingText,
      children,
      disabled,
      icon,
      spinnerColor = "white",
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        {...props}
        disabled={disabled || loading}
        icon={loading ? <Spinner color={spinnerColor} /> : icon}
      >
        {loading ? (loadingText ? loadingText : null) : children}
      </Button>
    );
  }
);

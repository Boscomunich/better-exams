// components/EmptyState.tsx
import React from "react";
import { XStack, YStack, Text, Image, Button } from "tamagui";
import { RefreshCw, AlertCircle, Search, Folder } from "@tamagui/lucide-icons";

export type EmptyStateProps = {
  /** Title text displayed prominently */
  title?: string;
  /** Descriptive subtitle or instructions */
  description?: string;
  /** Primary action button text */
  actionLabel?: string;
  /** Function called when action button is pressed */
  onAction?: () => void;
  /** Secondary action button text */
  secondaryActionLabel?: string;
  /** Function called when secondary button is pressed */
  onSecondaryAction?: () => void;
  /** Visual variant of the empty state */
  variant?: "default" | "search" | "error" | "offline" | "custom";
  /** Custom icon component */
  icon?: React.ReactNode;
  /** Custom image source (overrides icon) */
  imageSrc?: any;
  /** Custom image size */
  imageSize?: number;
  /** Whether to show a refresh button */
  showRefresh?: boolean;
  /** Function called when refresh is pressed */
  onRefresh?: () => void;
  /** Background color */
  backgroundColor?: string;
  /** Full height mode for screen-level empty states */
  fullScreen?: boolean;
};

export function EmptyState({
  title = "Nothing here yet",
  description = "This space is waiting for your content",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = "default",
  icon,
  imageSrc,
  imageSize = 120,
  showRefresh = false,
  onRefresh,
  backgroundColor = "transparent",
  fullScreen = false,
}: EmptyStateProps) {
  // Default icons for each variant
  const getDefaultIcon = () => {
    switch (variant) {
      case "search":
        return <Search size="$3" color="$black1" />;
      case "error":
        return <AlertCircle size="$3" color="$red9" />;
      case "offline":
        return <AlertCircle size="$3" color="$yellow9" />;
      default:
        return <Folder size="$3" color="$accent9" />;
    }
  };

  // Default titles and descriptions
  const getDefaultContent = () => {
    switch (variant) {
      case "search":
        return {
          title: "No results found",
          description: "Try adjusting your search terms",
        };
      case "error":
        return {
          title: "Something went wrong",
          description: "Please try again later",
        };
      case "offline":
        return {
          title: "No internet connection",
          description: "Check your connection and try again",
        };
      default:
        return { title, description };
    }
  };

  const content = getDefaultContent();
  const defaultIcon = getDefaultIcon();

  return (
    <YStack
      flex={fullScreen ? 1 : 0}
      justify="center"
      items="center"
      bg={backgroundColor as any}
      p="$6"
      gap="$4"
      minH={fullScreen ? "100%" : "auto"}
    >
      {/* Visual Element */}
      <YStack items="center" gap="$2">
        {imageSrc ? (
          <Image
            source={imageSrc}
            width={imageSize}
            height={imageSize}
            resizeMethod="resize"
          />
        ) : (
          <YStack
            items="center"
            justify="center"
            width={imageSize}
            height={imageSize}
            rounded="$12"
            bg="$background06"
          >
            {icon || defaultIcon}
          </YStack>
        )}
      </YStack>

      {/* Text Content */}
      <YStack items="center" gap="$2" maxW={300}>
        <Text fontSize="$7" fontWeight="600" text="center" color="$accent2">
          {content.title}
        </Text>
        <Text fontSize="$4" text="center" color="$accentColor" lineHeight="$2">
          {content.description}
        </Text>
      </YStack>

      {/* Actions */}
      <YStack items="center" gap="$3" width="100%">
        {showRefresh && onRefresh && (
          <Button
            icon={RefreshCw}
            onPress={onRefresh}
            size="$3"
            chromeless
            bg="#E71066"
          >
            Refresh
          </Button>
        )}

        {(actionLabel || secondaryActionLabel) && (
          <XStack gap="$3" justify="center">
            {actionLabel && onAction && (
              <Button onPress={onAction} size="$3" bg="#E71066">
                {actionLabel}
              </Button>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Button
                onPress={onSecondaryAction}
                size="$3"
                chromeless
                bg="#E71066"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}

// Optional: Pre-built variants for convenience
export const EmptyStates = {
  Search: (props: Partial<EmptyStateProps>) => (
    <EmptyState variant="search" {...props} />
  ),
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState variant="error" {...props} />
  ),
  Offline: (props: Partial<EmptyStateProps>) => (
    <EmptyState variant="offline" {...props} />
  ),
  Default: (props: Partial<EmptyStateProps>) => (
    <EmptyState variant="default" {...props} />
  ),
};

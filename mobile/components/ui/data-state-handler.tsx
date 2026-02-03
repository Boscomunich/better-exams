// components/DataStateHandler.tsx
import React from "react";
import { YStack } from "tamagui";
import { EmptyState } from "./empty";
import { ActivityIndicator } from "react-native";
import { Text } from "tamagui";

type DataStateHandlerProps = {
  isLoading: boolean;
  isError: boolean;
  error?: any;
  isOffline?: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  children: React.ReactNode;
};

export function DataStateHandler({
  isLoading,
  isError,
  error,
  isOffline = false,
  isEmpty,
  onRetry,
  onRefresh,
  children,
}: DataStateHandlerProps) {
  if (isOffline) {
    return (
      <EmptyState
        variant="offline"
        title="No Internet Connection"
        description="Check your connection and try again"
        showRefresh
        onRefresh={onRefresh}
        fullScreen
      />
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message || error?.message || "An error occurred";
    return (
      <EmptyState
        variant="error"
        title="Something went wrong"
        description={errorMessage}
        showRefresh
        onRefresh={onRefresh}
        actionLabel="Try Again"
        onAction={onRetry}
        fullScreen
      />
    );
  }

  if (isEmpty && !isLoading) {
    return (
      <EmptyState
        variant="default"
        title="No data found"
        description="There's nothing to display here yet"
        actionLabel="Refresh"
        onAction={onRefresh}
        fullScreen
      />
    );
  }

  if (isLoading && isEmpty) {
    return (
      <YStack flex={1} justify="center" items="center">
        <ActivityIndicator />
        <Text mt="$4">Loading...</Text>
      </YStack>
    );
  }

  return <>{children}</>;
}

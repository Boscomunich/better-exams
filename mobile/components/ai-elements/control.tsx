import { XStack, Button, Separator } from "tamagui";
import { Plus, Minus, RefreshCcw } from "@tamagui/lucide-icons";

export type ControlsProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
};

export function Controls({ onZoomIn, onZoomOut, onReset }: ControlsProps) {
  return (
    <XStack
      gap="$1"
      p="$1"
      rounded="$3"
      borderWidth={1}
      borderColor="$borderColor"
      bg="$background"
      elevation="$2"
    >
      {onZoomIn && (
        <Button size="$3" chromeless circular onPress={onZoomIn}>
          <Plus size={16} />
        </Button>
      )}

      {onZoomOut && (
        <Button size="$3" chromeless circular onPress={onZoomOut}>
          <Minus size={16} />
        </Button>
      )}

      {onReset && (
        <>
          <Separator vertical />
          <Button size="$3" chromeless circular onPress={onReset}>
            <RefreshCcw size={16} />
          </Button>
        </>
      )}
    </XStack>
  );
}

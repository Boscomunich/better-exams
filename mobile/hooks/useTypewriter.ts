import { useEffect, useState } from "react";

export function useTypewriter(text: string, enabled: boolean, speed = 18) {
  const [visibleText, setVisibleText] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setVisibleText(text);
      return;
    }

    let index = 0;
    setVisibleText("");

    const interval = setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  return visibleText;
}

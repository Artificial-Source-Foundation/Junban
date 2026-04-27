import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let disposed = false;
    let unlistenResize: (() => void) | undefined;

    void Promise.resolve()
      .then(async () => {
        const appWindow = getCurrentWindow();
        const syncMaximized = () => {
          void appWindow
            .isMaximized()
            .then((maximized) => {
              if (!disposed) setIsMaximized(maximized);
            })
            .catch(() => {});
        };

        syncMaximized();
        const unlisten = await appWindow.onResized(syncMaximized);
        if (disposed) {
          unlisten();
          return;
        }
        unlistenResize = unlisten;
      })
      .catch(() => {});

    return () => {
      disposed = true;
      unlistenResize?.();
    };
  }, []);

  const minimize = () => {
    void getCurrentWindow()
      .minimize()
      .catch(() => {});
  };

  const toggleMaximize = () => {
    void Promise.resolve()
      .then(async () => {
        const appWindow = getCurrentWindow();
        const maximized = await appWindow.isMaximized();
        if (maximized) {
          await appWindow.unmaximize();
          setIsMaximized(false);
          return;
        }

        await appWindow.maximize();
        setIsMaximized(true);
      })
      .catch(() => {});
  };

  const close = () => {
    void getCurrentWindow()
      .close()
      .catch(() => {});
  };

  const startDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    void getCurrentWindow()
      .startDragging()
      .catch(() => {});
  };

  return (
    <div className="flex h-9 shrink-0 items-center border-b border-border bg-surface text-on-surface shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
      <div onMouseDown={startDrag} className="h-full min-w-0 flex-1" />

      <div className="flex h-full items-center" aria-label="Window controls">
        <button
          type="button"
          onClick={minimize}
          aria-label="Minimize window"
          className="flex h-full w-11 items-center justify-center text-on-surface-secondary transition-colors hover:bg-surface-tertiary hover:text-on-surface"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={toggleMaximize}
          aria-label={isMaximized ? "Restore window" : "Maximize window"}
          className="flex h-full w-11 items-center justify-center text-on-surface-secondary transition-colors hover:bg-surface-tertiary hover:text-on-surface"
        >
          <Square size={12} className={isMaximized ? "scale-90" : ""} />
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Close window"
          className="flex h-full w-11 items-center justify-center text-on-surface-secondary transition-colors hover:bg-error hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

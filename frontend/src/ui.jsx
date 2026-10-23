import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// Peony's sheet focus fix: settle portal/scroll-lock writes before focus geometry.
export function focusSheet(event) {
  event.preventDefault();
  const sheet = event.target;
  if (!(sheet instanceof HTMLElement)) return;
  requestAnimationFrame(() => {
    if (sheet.isConnected && sheet.dataset.state === "open")
      sheet.focus({ preventScroll: true });
  });
}

export function Modal({ title, onClose, children, wide = false }) {
  const [open, setOpen] = useState(true);
  const close = useRef(onClose);
  const opener = useRef(document.activeElement);
  const finished = useRef(false);
  close.current = onClose;
  function finish() {
    if (finished.current) return;
    finished.current = true;
    close.current();
  }
  function requestClose() {
    setOpen(false);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
  }
  useEffect(() => {
    if (open) return;
    // Fallback if animationend is absent, e.g. a background tab.
    const timer = setTimeout(finish, 260);
    return () => clearTimeout(timer);
  }, [open]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" data-slot="sheet-overlay" />
        <Dialog.Content
          className={"modal" + (wide ? " wide" : "")}
          data-slot="sheet-content"
          aria-describedby={undefined}
          onOpenAutoFocus={focusSheet}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected)
              opener.current.focus({ preventScroll: true });
          }}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && !open) finish();
          }}
        >
          <div className="modal-head">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-btn" title="بستن" aria-label="بستن">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <div className="modal-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

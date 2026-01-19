import React from "react";

type ModalProps = {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  width = 640,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: `min(${width}px, 100%)`,
          background: "white",
          borderRadius: 8,
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}

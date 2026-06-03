import * as Dialog from "@radix-ui/react-dialog";

interface ImagePreviewDialogProps {
  imageSrc: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal image preview using an iframe. Radix Dialog provides Esc-to-close,
 * overlay-click-to-close, and focus management out of the box.
 * The parent should only open this for a valid `data:image/` source.
 */
export function ImagePreviewDialog({
  imageSrc,
  open,
  onOpenChange,
}: ImagePreviewDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content" aria-describedby={undefined}>
          <Dialog.Title className="dialog-title">截图预览</Dialog.Title>
          {imageSrc && (
            <iframe
              className="dialog-iframe"
              src={imageSrc}
              title="截图预览"
            />
          )}
          <Dialog.Close asChild>
            <button type="button" className="dialog-close" aria-label="关闭">
              关闭
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

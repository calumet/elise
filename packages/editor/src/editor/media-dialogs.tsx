import { Alert } from "@calumet/elise-ui/alert";
import { Button } from "@calumet/elise-ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@calumet/elise-ui/dialog";
import { Field } from "@calumet/elise-ui/field";
import { FileUpload, FileUploadItem, FileUploadList } from "@calumet/elise-ui/file-upload";
import { Image } from "@calumet/elise-ui/image";
import { Input } from "@calumet/elise-ui/input";
import { BlockStack } from "@calumet/elise-ui/stack";
import { useEditorRef } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { useEditorCommands } from "./commands";

type MediaDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

const useReturnFocus = () => {
  const editor = useEditorRef();
  return (event: Event) => {
    event.preventDefault();
    editor.tf.focus();
  };
};

export const ImageDialog = ({ open, onOpenChange }: MediaDialogProps): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const returnFocus = useReturnFocus();
  const [picked, setPicked] = React.useState<{ file: File; preview: string } | null>(null);
  const [alt, setAlt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const latest = React.useRef<File | null>(null);
  const file = picked?.file ?? null;

  const pick = (next: File | null) => {
    latest.current = next;
    setPicked(null);
    if (!next) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (latest.current === next) setPicked({ file: next, preview: String(reader.result) });
    };
    reader.readAsDataURL(next);
  };

  const change = (next: boolean) => {
    if (!next) {
      pick(null);
      setAlt("");
      setBusy(false);
      setFailed(false);
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await commands.insertImage(file, alt.trim());
      change(false);
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent onCloseAutoFocus={returnFocus}>
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{t.insertImage}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <BlockStack gap={4}>
              {failed ? <Alert tone="danger">{t.uploadFailed}</Alert> : null}
              {picked ? (
                <BlockStack gap={2}>
                  <Image
                    src={picked.preview}
                    alt=""
                    fill
                    aspectRatio="16/9"
                    objectFit="contain"
                    radius="lg"
                    border
                  />
                  <FileUploadList>
                    <FileUploadItem
                      name={picked.file.name}
                      size={picked.file.size}
                      onRemove={() => pick(null)}
                    />
                  </FileUploadList>
                </BlockStack>
              ) : (
                <FileUpload
                  accept="image/*"
                  label={t.imageFile}
                  onFiles={(accepted) => pick(accepted[0] ?? null)}
                />
              )}
              <Field label={t.altText} description={t.altTextHint}>
                {(control) => (
                  <Input
                    {...control}
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                  />
                )}
              </Field>
            </BlockStack>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!file} loading={busy}>
              {t.insert}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const FileDialog = ({ open, onOpenChange }: MediaDialogProps): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const returnFocus = useReturnFocus();
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const change = (next: boolean) => {
    if (!next) {
      setFile(null);
      setBusy(false);
      setFailed(false);
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await commands.insertFile(file);
      change(false);
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent size="sm" onCloseAutoFocus={returnFocus}>
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{t.insertFile}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <BlockStack gap={4}>
              {failed ? <Alert tone="danger">{t.uploadFileFailed}</Alert> : null}
              {file ? (
                <FileUploadList>
                  <FileUploadItem
                    name={file.name}
                    size={file.size}
                    onRemove={() => setFile(null)}
                  />
                </FileUploadList>
              ) : (
                <FileUpload label={t.file} onFiles={(accepted) => setFile(accepted[0] ?? null)} />
              )}
            </BlockStack>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!file} loading={busy}>
              {t.insert}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export type MediaKind = "image" | "video" | "file";

export const MediaDialogs = ({
  open,
  onClose,
}: {
  open: MediaKind | null;
  onClose: () => void;
}): React.JSX.Element => {
  const close = (next: boolean) => {
    if (!next) onClose();
  };
  return (
    <>
      <ImageDialog open={open === "image"} onOpenChange={close} />
      <VideoDialog open={open === "video"} onOpenChange={close} />
      <FileDialog open={open === "file"} onOpenChange={close} />
    </>
  );
};

export const isMediaKind = (id: string): id is MediaKind =>
  id === "image" || id === "video" || id === "file";

export const VideoDialog = ({ open, onOpenChange }: MediaDialogProps): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const returnFocus = useReturnFocus();
  const [url, setUrl] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);

  const change = (next: boolean) => {
    if (!next) {
      setUrl("");
      setInvalid(false);
    }
    onOpenChange(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (commands.insertVideo(url)) change(false);
    else setInvalid(true);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent size="sm" onCloseAutoFocus={returnFocus}>
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{t.insertVideo}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field
              label={t.videoAddress}
              description={t.videoAddressHint}
              error={invalid ? t.invalidVideo : undefined}
            >
              {(control) => (
                <Input
                  {...control}
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setInvalid(false);
                  }}
                />
              )}
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={url.trim() === ""}>
              {t.insert}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
  const [file, setFile] = React.useState<File | null>(null);
  const [alt, setAlt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const preview = React.useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);

  React.useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const change = (next: boolean) => {
    if (!next) {
      setFile(null);
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
              {file && preview ? (
                <BlockStack gap={2}>
                  <Image
                    src={preview}
                    alt=""
                    fill
                    aspectRatio="16/9"
                    objectFit="contain"
                    radius="lg"
                    border
                  />
                  <FileUploadList>
                    <FileUploadItem
                      name={file.name}
                      size={file.size}
                      onRemove={() => setFile(null)}
                    />
                  </FileUploadList>
                </BlockStack>
              ) : (
                <FileUpload
                  accept="image/*"
                  label={t.imageFile}
                  onFiles={(accepted) => setFile(accepted[0] ?? null)}
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

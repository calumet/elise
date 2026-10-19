import {
  Columns2,
  Heading2,
  Heading3,
  Image,
  Images,
  Info,
  Minus,
  MousePointerClick,
  MoveVertical,
  Paperclip,
  Pilcrow,
  Quote,
  RectangleVertical,
  SquarePlay,
  Table,
} from "@calumet/elise-icons";

export type BlockIcon = typeof Pilcrow;

const ICONS: Record<string, BlockIcon> = {
  p: Pilcrow,
  h2: Heading2,
  h3: Heading3,
  blockquote: Quote,
  callout: Info,
  hr: Minus,
  img: Image,
  media_embed: SquarePlay,
  table: Table,
  columns: Columns2,
  column: RectangleVertical,
  spacer: MoveVertical,
  button: MousePointerClick,
  gallery: Images,
  file: Paperclip,
};

export const blockIcon = (type: string): BlockIcon => ICONS[type] ?? Pilcrow;

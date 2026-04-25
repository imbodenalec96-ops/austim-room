/**
 * Avatar — initials in a calm coloured circle, with optional photo.
 * Color is deterministic on the name so each student keeps the same
 * tile color across the app.
 */

const PALETTE = [
  "#cfe0ee", // calm blue
  "#dbe7d3", // sage
  "#fde6c4", // butter
  "#f4d4d4", // dusty rose
  "#dcd2ea", // lavender
  "#cfe7e2", // mint
  "#f1d9c8", // peach
  "#d6e3d0", // moss
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  ring?: boolean;
  className?: string;
};

export function Avatar({
  name,
  photoUrl,
  size = 48,
  ring,
  className,
}: AvatarProps) {
  const bg = colorForName(name);
  const initials = initialsOf(name);
  const fontSize = Math.round(size * 0.4);
  const ringStyle = ring
    ? { boxShadow: "0 0 0 3px white, 0 0 0 5px rgba(0,0,0,0.1)" }
    : undefined;

  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flex: "0 0 auto",
          ...ringStyle,
        }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#1f2a37",
        fontWeight: 700,
        fontSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        letterSpacing: "0.02em",
        ...ringStyle,
      }}
    >
      {initials}
    </div>
  );
}

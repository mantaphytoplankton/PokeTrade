import Image from "next/image";

// Precedence per SRCH-06: user photo > catalog image > placeholder.
export function CardThumb({
  name,
  userPhotoUrl,
  catalogImageUrl,
  size = 96,
  rare = false,
}: {
  name: string;
  userPhotoUrl?: string;
  catalogImageUrl?: string;
  size?: number;
  rare?: boolean;
}) {
  const imageUrl = userPhotoUrl || catalogImageUrl;

  return (
    <div
      className="relative aspect-[3/4] rounded-lg border-[2.5px] border-ink overflow-hidden flex items-center justify-center bg-neutral-100"
      style={{ width: size }}
    >
      {rare ? <span className="holo-corner absolute -top-px -right-px w-10 h-10 [clip-path:polygon(100%_0,0_0,100%_100%)]" aria-hidden="true" /> : null}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="text-xs font-bold text-neutral-700 text-center px-2">No photo yet</span>
      )}
    </div>
  );
}

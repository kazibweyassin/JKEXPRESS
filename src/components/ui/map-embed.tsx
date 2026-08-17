export function MapEmbed({
  query,
  latitude,
  longitude,
  title = "Map",
  className = "h-64 w-full",
}: {
  query?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  className?: string;
}) {
  const src =
    latitude != null && longitude != null
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(query || "Kampala, Uganda")}&z=14&output=embed`;

  return (
    <iframe
      title={title}
      src={src}
      className={`rounded-2xl border border-slate-200 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

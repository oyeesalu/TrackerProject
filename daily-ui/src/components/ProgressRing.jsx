export default function ProgressRing({ value = 0, size = 96, stroke = 10, label }) {
  const pct = Math.max(0, Math.min(100, value));
  const ring = `conic-gradient(#111 ${pct}%, #e5e7eb 0)`;
  const style = {
    width: size,
    height: size,
    backgroundImage: ring,
    backgroundColor: "#e5e7eb", // fallback base
    backgroundSize: "100% 100%",
  };
  const inner = size - stroke * 2;

  return (
    <div
      className="relative rounded-full"
      style={style}
      role="img"
      aria-label={label ? `${label} ${pct}%` : `Progress ${pct}%`}
    >
      <div
        className="absolute inset-0 rounded-full bg-white flex items-center justify-center"
        style={{
          width: inner,
          height: inner,
          top: stroke,
          left: stroke,
          right: stroke,
          bottom: stroke,
          margin: "auto",
          position: "absolute",
        }}
      >
        <span className="text-sm font-medium">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
export default function SoftFadeDivider({ className = "" }) {
  return (
    <div
      className={`h-24 bg-gradient-to-b from-[#050505] to-transparent ${className}`}
      role="separator"
    />
  );
}
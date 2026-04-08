export default function AmberDivider({ className = "" }) {
  return (
    <div
      className={`w-full h-px bg-gradient-to-r from-transparent via-[#CDA755]/25 to-transparent ${className}`}
      role="separator"
    />
  );
}

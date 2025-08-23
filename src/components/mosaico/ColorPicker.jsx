export default function ColorPicker({ value, onChange }) {
  return (
    <label className="relative w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden block">
      <div
        className="w-full h-full"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
  );
}

interface Props {
  name:         string;
  label:        string;
  defaultValue: string;
  type?:        string;
  required?:    boolean;
  textarea?:    boolean;
  hint?:        string;
  rows?:        number;
}
export default function SettingsField({
  name, label, defaultValue, type = "text", required = false, textarea = false, hint, rows = 3,
}: Props) {
  const base = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-colors";
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-slate-600 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} required={required}
          className={`${base} resize-none`} />
      ) : (
        <input id={name} name={name} type={type} defaultValue={defaultValue} required={required}
          className={base} />
      )}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

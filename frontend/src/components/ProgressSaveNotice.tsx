export function ProgressSaveNotice({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (!error) return null;
  return (
    <div role="alert" dir="rtl" className="fixed top-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-2xl bg-white p-4 shadow-xl border border-red-300 font-tajawal">
      <p>{error}</p>
      <button type="button" onClick={onRetry} className="mt-2 rounded-full px-4 py-2 text-white" style={{ backgroundColor: "#652b82" }}>إعادة حفظ التقدم</button>
    </div>
  );
}

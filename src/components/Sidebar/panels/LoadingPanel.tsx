export function LoadingPanel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="panel panel--loading" role="status">
      <div className="panel__loader" aria-hidden="true">
        <span>{icon}</span>
      </div>
      <p className="panel__text">{label}</p>
      <div className="panel__skeleton" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

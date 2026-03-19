export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      {Icon && (
        <Icon size={40} className="mb-4 opacity-40 text-(--text-muted)" />
      )}
      <p className="mb-1 font-syne text-lg font-semibold text-(--text-primary)">
        {title}
      </p>
      <p className="max-w-xs text-sm text-(--text-muted)">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

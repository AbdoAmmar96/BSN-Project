export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-10">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
          <Icon size={32} />
        </div>
      )}
      <h4 className="font-display font-black text-lg text-brand-ink">{title}</h4>
      {description && <p className="text-sm opacity-70 mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

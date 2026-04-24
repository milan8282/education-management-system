const StatCard = ({ title, value, icon: Icon, helper }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-950">{value ?? 0}</h3>
          {helper && <p className="mt-2 text-xs font-medium text-slate-400">{helper}</p>}
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon size={23} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
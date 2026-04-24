import { Inbox } from "lucide-react";

const EmptyState = ({ title = "No data found", description = "There is nothing to show right now." }) => {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default EmptyState;
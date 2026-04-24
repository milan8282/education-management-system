const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};

export default Loader;
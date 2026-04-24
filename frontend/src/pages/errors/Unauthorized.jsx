import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
        <p className="mt-3 text-slate-500">
          You do not have permission to access this page.
        </p>

        <Link
          to="/"
          className="inline-flex mt-6 rounded-xl bg-slate-900 px-5 py-3 text-white font-medium"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
}
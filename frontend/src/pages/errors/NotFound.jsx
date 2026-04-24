import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">404</h1>
        <p className="mt-3 text-slate-500">Page not found.</p>

        <Link
          to="/"
          className="inline-flex mt-6 rounded-xl bg-slate-900 px-5 py-3 text-white font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
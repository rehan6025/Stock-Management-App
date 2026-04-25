import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const error = sp.error === "1";
  const next = sp.next ?? "/";

  return (
    <div className="min-h-dvh px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-lg">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Campa Stock</h1>
          <p className="text-sm text-zinc-400">
            Enter the shared password to continue.
          </p>
        </div>

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <label className="block text-sm font-medium text-zinc-200">
            Password
            <input
              name="password"
              type="password"
              autoFocus
              className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-zinc-50 outline-none focus:ring-2 focus:ring-emerald-400/40"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              Wrong password.
            </div>
          ) : null}

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-emerald-500 text-zinc-950 font-semibold active:scale-[0.99]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}


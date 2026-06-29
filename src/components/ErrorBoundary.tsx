import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Catches render-time errors so the app shows a readable message instead of a
 * blank white screen, and logs the full error to the console for debugging.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[mdflow] render error:", error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] p-6">
        <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-rose-700">
            Une erreur est survenue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            L'application a rencontré un problème d'affichage. Détail technique :
          </p>
          <pre className="mt-3 max-h-60 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-rose-200">
            {error.message}
            {error.stack ? "\n\n" + error.stack : ""}
          </pre>
          <button
            onClick={() => {
              this.setState({ error: null });
              location.hash = "#/login";
              location.reload();
            }}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }
}

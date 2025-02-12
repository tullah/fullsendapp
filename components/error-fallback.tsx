interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200 max-w-2xl mx-auto my-4">
      <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
      <p className="text-sm text-red-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium
                 hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
} 
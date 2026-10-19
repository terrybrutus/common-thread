export default function App() {
  return (
    <div
      data-ocid="page"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center"
    >
      <main className="flex flex-col items-center gap-3">
        <h1
          data-ocid="page.title"
          className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          Common Thread
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          A minimal Caffeine starter.
        </p>
      </main>
    </div>
  );
}

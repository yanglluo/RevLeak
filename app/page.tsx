import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 bg-background text-foreground">
      <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm lg:flex-col">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            RevLeak
          </h1>
          <h2 className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-light">
            Stop revenue leaks before they drain your business.
          </h2>
        </div>

        <div className="space-y-4 mb-12 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-green-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-lg">
              Identify failed payments instantly.
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-green-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-lg">
              Recover lost revenue with automated alerts.
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-green-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-lg">
              Get actionable insights on churn.
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/connect"
            className="rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] text-lg px-8 py-3 font-semibold flex items-center space-x-2"
          >
            <span>Connect Stripe (Early Access)</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Read-only access. No money movement.
          </p>
        </div>
      </div>
    </main>
  );
}

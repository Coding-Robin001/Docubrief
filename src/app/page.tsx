import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1>PDF REVIEWER HOME PAGE</h1>
        <p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-lg bg-white text-black px-6 py-3 font-medium hover:bg-gray-200 transition"
          >
            Start building for free
          </Link>
        </p>
      </main>
    </div>
  );
}

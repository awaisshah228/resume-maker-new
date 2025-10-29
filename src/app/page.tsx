import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link href="/editor" className="underline">
        Open the Resume Editor
      </Link>
    </div>
  );
}

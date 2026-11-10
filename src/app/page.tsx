import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        {siteConfig.name}
      </h1>
      <p className="max-w-md text-lg">{siteConfig.description}</p>
      <p className="text-sm">Em breve.</p>
    </main>
  );
}

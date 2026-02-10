import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          Web3 KOL Twitter Account Generator
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Generate Authentic Web3 Content Like Top KOLs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link href="/generator" className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-2xl font-semibold mb-4">🐦 AI Tweet Generator</h2>
            <p className="text-muted-foreground mb-4">
              Generate tweets in the style of specific Web3 KOLs with AI-powered analysis
            </p>
            <div className="text-primary font-medium">시작하기 →</div>
          </Link>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-2xl font-semibold mb-4">🎨 AI Image Generator</h2>
            <p className="text-muted-foreground mb-4">
              Create custom images with KOL visual styles for your Web3 projects
            </p>
            <div className="text-muted-foreground font-medium">Coming Soon</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            ✅ Project setup complete. Ready to generate tweets!
          </p>
        </div>
      </div>
    </main>
  );
}

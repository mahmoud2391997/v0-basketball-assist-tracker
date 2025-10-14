import { AssistTracker } from "@/components/assist-tracker"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-sans text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Career Assists <span className="text-primary">Leaderboard</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">Tracking the chase for the national record</p>
        </div>
        <AssistTracker />
      </div>
    </main>
  )
}

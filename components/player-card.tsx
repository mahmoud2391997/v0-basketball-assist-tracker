"use client"

import type { Player } from "./assist-tracker"
import { Card } from "./ui/card"
import { Trophy } from "lucide-react"
import Image from "next/image"

interface PlayerCardProps {
  player: Player
  rank: number
  maxAssists: number
}

export function PlayerCard({ player, rank, maxAssists }: PlayerCardProps) {
  const progressPercentage = (player.assists / maxAssists) * 100

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
        player.isTracked
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {/* Progress Bar Background */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${player.isTracked ? "bg-primary/10" : "bg-muted/30"}`}
        style={{
          width: `${progressPercentage}%`,
        }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-4 p-4 md:gap-6 md:p-6">
        {/* Rank */}
        <div className="flex flex-shrink-0 flex-col items-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full font-bold md:h-14 md:w-14 ${
              rank === 1
                ? "bg-primary text-primary-foreground"
                : player.isTracked
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {rank === 1 ? <Trophy className="h-6 w-6" /> : `#${rank}`}
          </div>
        </div>

        {/* Player Image */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-border md:h-20 md:w-20">
          <Image src={player.imageUrl || "/placeholder.svg"} alt={player.name} fill className="object-cover" />
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`truncate font-sans text-lg font-bold md:text-xl ${
              player.isTracked ? "text-primary" : "text-foreground"
            }`}
          >
            {player.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground md:text-base">{player.school}</p>
        </div>

        {/* Assists Count */}
        <div className="flex-shrink-0 text-right">
          <div
            className={`font-mono text-2xl font-bold md:text-3xl ${
              player.isTracked ? "text-primary" : "text-foreground"
            }`}
          >
            {player.assists}
          </div>
          <div className="text-xs text-muted-foreground md:text-sm">assists</div>
        </div>
      </div>

      {/* Tracked Player Badge */}
      {player.isTracked && (
        <div className="absolute right-0 top-0 bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          TRACKING
        </div>
      )}
    </Card>
  )
}

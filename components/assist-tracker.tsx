"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PlayerCard } from "./player-card"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Undo2, Plus } from "lucide-react"

export interface Player {
  id: string
  name: string
  school: string
  assists: number
  isTracked?: boolean
  imageUrl?: string
}

const fallbackPlayers: Player[] = [
  {
    id: "1",
    name: "Bobby Hurley",
    school: "Duke",
    assists: 1076,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "2",
    name: "Chris Corchiani",
    school: "NC State",
    assists: 1038,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "3",
    name: "Ed Cota",
    school: "North Carolina",
    assists: 1030,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "4",
    name: "Jason Brickman",
    school: "Long Island University",
    assists: 1007,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "5",
    name: "Keith Jennings",
    school: "East Tennessee State",
    assists: 983,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "6",
    name: "Steve Blake",
    school: "Maryland",
    assists: 972,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "7",
    name: "Sherman Douglas",
    school: "Syracuse",
    assists: 960,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "8",
    name: "Tony Miller",
    school: "Marquette",
    assists: 956,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "9",
    name: "Aaron Miles",
    school: "Kansas",
    assists: 954,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "10",
    name: "Greg Anthony",
    school: "Nevada-Las Vegas",
    assists: 950,
    imageUrl: "/basketball-player-portrait.png",
  },
  {
    id: "braden-smith",
    name: "Braden Smith",
    school: "Purdue",
    assists: 758,
    isTracked: true,
    imageUrl: "/purdue-basketball-player.jpg",
  },
]

export function AssistTracker() {
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [lastChange, setLastChange] = useState<{ id: string; delta: number } | null>(null)
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const maxAssists = Math.max(...players.map((p) => p.assists))
  const trackedPlayer = players.find((p) => p.isTracked)

  useEffect(() => {
    // Check if Firebase is configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.log("[v0] Firebase not configured, using fallback data")
      setIsFirebaseEnabled(false)
      return
    }

    setIsFirebaseEnabled(true)
    console.log("[v0] Setting up Firebase real-time listener")

    const playersQuery = query(collection(db, "players"), orderBy("assists", "desc"))

    const unsubscribe = onSnapshot(
      playersQuery,
      (snapshot) => {
        const updatedPlayers: Player[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          updatedPlayers.push({
            id: doc.id,
            name: data.name || "Unknown",
            school: data.school || data.team || "",
            assists: data.assists || 0,
            imageUrl: data.imageUrl || "/basketball-player-portrait.png",
            isTracked: doc.id === "braden-smith",
          })
        })

        setPlayers(updatedPlayers)
        setLastUpdate(new Date().toLocaleTimeString())
        console.log("[v0] Players updated from Firebase:", updatedPlayers.length)
      },
      (error) => {
        console.error("[v0] Firebase listener error:", error)
        setIsFirebaseEnabled(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const handleIncrementAssist = async () => {
    if (!trackedPlayer) return

    if (!isFirebaseEnabled) {
      // Fallback: local state update
      setPlayers((prev) =>
        prev.map((p) => (p.isTracked ? { ...p, assists: p.assists + 1 } : p)).sort((a, b) => b.assists - a.assists),
      )
      setLastChange({ id: trackedPlayer.id, delta: 1 })
      setLastUpdate(new Date().toLocaleTimeString())
      return
    }

    setIsLoading(true)
    try {
      const playerDoc = doc(db, "players", trackedPlayer.id)
      await updateDoc(playerDoc, {
        assists: increment(1),
        lastUpdated: serverTimestamp(),
      })
      setLastChange({ id: trackedPlayer.id, delta: 1 })
      setLastUpdate(new Date().toLocaleTimeString())
      console.log("[v0] Assist incremented successfully")
    } catch (error) {
      console.error("[v0] Failed to increment assist:", error)
      alert("Failed to update assist. Check console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = async () => {
    if (!lastChange || !trackedPlayer || lastChange.id !== trackedPlayer.id) {
      alert("No recent change to undo for the tracked player.")
      return
    }

    if (!isFirebaseEnabled) {
      // Fallback: local state update
      setPlayers((prev) =>
        prev
          .map((p) => (p.isTracked ? { ...p, assists: p.assists - lastChange.delta } : p))
          .sort((a, b) => b.assists - a.assists),
      )
      setLastChange(null)
      setLastUpdate(new Date().toLocaleTimeString())
      return
    }

    setIsLoading(true)
    try {
      const playerDoc = doc(db, "players", trackedPlayer.id)
      await updateDoc(playerDoc, {
        assists: increment(-lastChange.delta),
        lastUpdated: serverTimestamp(),
      })
      setLastChange(null)
      setLastUpdate(new Date().toLocaleTimeString())
      console.log("[v0] Undo successful")
    } catch (error) {
      console.error("[v0] Undo failed:", error)
      alert("Undo failed. Check console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.assists - a.assists)

  return (
    <div className="space-y-6">
      {/* Firebase Status Indicator */}
      {!isFirebaseEnabled && (
        <Card className="border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Demo Mode:</strong> Firebase not configured. Using local data. Add Firebase environment variables to
            enable real-time updates.
          </p>
        </Card>
      )}

      {/* Update Controls */}
      {trackedPlayer && (
        <Card className="border-primary/20 bg-card/50 p-6 backdrop-blur">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{trackedPlayer.name}</h3>
              <p className="text-sm text-muted-foreground">{trackedPlayer.school}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{trackedPlayer.assists}</div>
              <div className="text-xs text-muted-foreground">assists</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleIncrementAssist}
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Assist
            </Button>
            <Button
              onClick={handleUndo}
              disabled={isLoading || !lastChange}
              variant="outline"
              className="flex-1 border-primary/20 bg-transparent"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Need <span className="font-semibold text-foreground">{maxAssists - trackedPlayer.assists + 1}</span> more
              to break the record
            </p>
            {lastUpdate && <p className="text-xs text-muted-foreground">Updated: {lastUpdate}</p>}
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <PlayerCard key={player.id} player={player} rank={index + 1} maxAssists={maxAssists} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Tracked Player</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span>Record Holders</span>
        </div>
      </div>
    </div>
  )
}

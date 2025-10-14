"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Trash2, Edit2, Save, X, Lock, LogOut } from "lucide-react"
import type { Player } from "@/components/assist-tracker"
import Link from "next/link"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Player>>({})
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newPlayerForm, setNewPlayerForm] = useState<Partial<Player>>({
    name: "",
    school: "",
    assists: 0,
    imageUrl: "/basketball-player-portrait.png",
    isTracked: false,
  })
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false)

  // Check authentication
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("admin_authenticated")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Firebase listener
  useEffect(() => {
    if (!isAuthenticated) return

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      setIsFirebaseEnabled(false)
      return
    }

    setIsFirebaseEnabled(true)

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
            isTracked: data.isTracked || false,
          })
        })
        setPlayers(updatedPlayers)
      },
      (error) => {
        console.error("[v0] Firebase listener error:", error)
        setIsFirebaseEnabled(false)
      },
    )

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - in production, use proper authentication
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"
    if (password === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem("admin_authenticated", "true")
      setPassword("")
    } else {
      alert("Incorrect password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("admin_authenticated")
  }

  const handleIncrement = async (playerId: string) => {
    if (!isFirebaseEnabled) return
    try {
      const playerDoc = doc(db, "players", playerId)
      await updateDoc(playerDoc, {
        assists: players.find((p) => p.id === playerId)!.assists + 1,
      })
    } catch (error) {
      console.error("[v0] Failed to increment:", error)
      alert("Failed to update. Check console.")
    }
  }

  const handleDecrement = async (playerId: string) => {
    if (!isFirebaseEnabled) return
    const player = players.find((p) => p.id === playerId)
    if (!player || player.assists <= 0) return

    try {
      const playerDoc = doc(db, "players", playerId)
      await updateDoc(playerDoc, {
        assists: player.assists - 1,
      })
    } catch (error) {
      console.error("[v0] Failed to decrement:", error)
      alert("Failed to update. Check console.")
    }
  }

  const handleEdit = (player: Player) => {
    setEditingId(player.id)
    setEditForm(player)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !isFirebaseEnabled) return

    try {
      const playerDoc = doc(db, "players", editingId)
      await updateDoc(playerDoc, {
        name: editForm.name,
        school: editForm.school,
        assists: editForm.assists,
        imageUrl: editForm.imageUrl,
        isTracked: editForm.isTracked,
      })
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      console.error("[v0] Failed to save edit:", error)
      alert("Failed to save. Check console.")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (playerId: string) => {
    if (!isFirebaseEnabled) return
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      await deleteDoc(doc(db, "players", playerId))
    } catch (error) {
      console.error("[v0] Failed to delete:", error)
      alert("Failed to delete. Check console.")
    }
  }

  const handleAddNew = async () => {
    if (!isFirebaseEnabled) return
    if (!newPlayerForm.name || !newPlayerForm.school) {
      alert("Name and school are required")
      return
    }

    try {
      // Create a URL-friendly ID from the name
      const playerId = newPlayerForm.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      await setDoc(doc(db, "players", playerId), {
        name: newPlayerForm.name,
        school: newPlayerForm.school,
        assists: newPlayerForm.assists || 0,
        imageUrl: newPlayerForm.imageUrl || "/basketball-player-portrait.png",
        isTracked: newPlayerForm.isTracked || false,
      })

      setIsAddingNew(false)
      setNewPlayerForm({
        name: "",
        school: "",
        assists: 0,
        imageUrl: "/basketball-player-portrait.png",
        isTracked: false,
      })
    } catch (error) {
      console.error("[v0] Failed to add player:", error)
      alert("Failed to add player. Check console.")
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-primary/20 bg-card/50 p-8 backdrop-blur">
          <div className="mb-6 text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="mb-2 text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Enter password to access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Login
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back to Leaderboard
            </Link>
          </div>
        </Card>
      </main>
    )
  }

  // Admin panel
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              Admin <span className="text-primary">Panel</span>
            </h1>
            <p className="text-muted-foreground">Manage player statistics and data</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="border-primary/20 bg-transparent">
                View Leaderboard
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="border-primary/20 bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Firebase Status */}
        {!isFirebaseEnabled && (
          <Card className="mb-6 border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              <strong>Warning:</strong> Firebase not configured. Add Firebase environment variables to enable data
              management.
            </p>
          </Card>
        )}

        {/* Add New Player */}
        <Card className="mb-6 border-primary/20 bg-card/50 p-6 backdrop-blur">
          {!isAddingNew ? (
            <Button
              onClick={() => setIsAddingNew(true)}
              disabled={!isFirebaseEnabled}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Player
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Add New Player</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="new-name">Name *</Label>
                  <Input
                    id="new-name"
                    value={newPlayerForm.name}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                    placeholder="Player name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-school">School *</Label>
                  <Input
                    id="new-school"
                    value={newPlayerForm.school}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, school: e.target.value })}
                    placeholder="School name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-assists">Assists</Label>
                  <Input
                    id="new-assists"
                    type="number"
                    value={newPlayerForm.assists}
                    onChange={(e) =>
                      setNewPlayerForm({ ...newPlayerForm, assists: Number.parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-image">Image URL</Label>
                  <Input
                    id="new-image"
                    value={newPlayerForm.imageUrl}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, imageUrl: e.target.value })}
                    placeholder="/basketball-player-portrait.png"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-tracked"
                  checked={newPlayerForm.isTracked}
                  onChange={(e) => setNewPlayerForm({ ...newPlayerForm, isTracked: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="new-tracked" className="cursor-pointer">
                  Set as tracked player
                </Label>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddNew}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Player
                </Button>
                <Button onClick={() => setIsAddingNew(false)} variant="outline" className="flex-1 border-primary/20">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Players List */}
        <div className="space-y-3">
          {players.map((player) => (
            <Card
              key={player.id}
              className={`border-primary/20 bg-card/50 p-4 backdrop-blur transition-all ${
                player.isTracked ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              {editingId === player.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`edit-name-${player.id}`}>Name</Label>
                      <Input
                        id={`edit-name-${player.id}`}
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-school-${player.id}`}>School</Label>
                      <Input
                        id={`edit-school-${player.id}`}
                        value={editForm.school}
                        onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-assists-${player.id}`}>Assists</Label>
                      <Input
                        id={`edit-assists-${player.id}`}
                        type="number"
                        value={editForm.assists}
                        onChange={(e) => setEditForm({ ...editForm, assists: Number.parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-image-${player.id}`}>Image URL</Label>
                      <Input
                        id={`edit-image-${player.id}`}
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`edit-tracked-${player.id}`}
                      checked={editForm.isTracked}
                      onChange={(e) => setEditForm({ ...editForm, isTracked: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`edit-tracked-${player.id}`} className="cursor-pointer">
                      Set as tracked player
                    </Label>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1 border-primary/20 bg-transparent"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{player.name}</h3>
                      {player.isTracked && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          Tracked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{player.school}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{player.assists}</div>
                    <div className="text-xs text-muted-foreground">assists</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleIncrement(player.id)}
                      disabled={!isFirebaseEnabled}
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDecrement(player.id)}
                      disabled={!isFirebaseEnabled}
                      size="sm"
                      variant="outline"
                      className="border-primary/20"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleEdit(player)}
                      disabled={!isFirebaseEnabled}
                      size="sm"
                      variant="outline"
                      className="border-primary/20"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(player.id)}
                      disabled={!isFirebaseEnabled}
                      size="sm"
                      variant="outline"
                      className="border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {players.length === 0 && isFirebaseEnabled && (
          <Card className="border-primary/20 bg-card/50 p-12 text-center backdrop-blur">
            <p className="text-muted-foreground">No players found. Add your first player above.</p>
          </Card>
        )}
      </div>
    </main>
  )
}

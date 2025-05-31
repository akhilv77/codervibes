"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlayersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    players,
    addPlayer,
    deletePlayer,
    updatePlayerName
  } = useStore();

  useEffect(() => {
    // Simulate loading state while IndexedDB operations complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    // Check for auto parameter
    if (searchParams?.get('auto') === 'true') {
      setAddDialogOpen(true);
      // Clean up the URL
      router.replace('/scorecard/players');
    }

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      addPlayer(playerName);
      setPlayerName("");
      setAddDialogOpen(false);
    }
  };

  const handleEditPlayer = () => {
    if (selectedPlayer && playerName.trim()) {
      updatePlayerName(selectedPlayer.id, playerName);
      setPlayerName("");
      setSelectedPlayer(null);
      setEditDialogOpen(false);
    }
  };

  const handleDeletePlayer = () => {
    if (selectedPlayer) {
      deletePlayer(selectedPlayer.id);
      setSelectedPlayer(null);
      setDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (player: { id: string; name: string }) => {
    setSelectedPlayer(player);
    setPlayerName(player.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (player: { id: string; name: string }) => {
    setSelectedPlayer(player);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Players"
        description="Manage your players"
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add a new player</DialogTitle>
                <DialogDescription>
                  Enter the player's name to add them to your games.
                </DialogDescription>
              </DialogHeader>
              <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Input
                    placeholder="Enter player name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPlayer} disabled={!playerName.trim()}>
                  Add Player
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading variant="default" size="lg" text="Loading players..." />
        </div>
      ) : (
        <div className="space-y-6">
          {players.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No players yet</AlertTitle>
              <AlertDescription>
                Add players to get started with your games.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((player) => (
                <Card key={player.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border">
                        <AvatarImage src={player.avatarUrl} alt={player.name} />
                        <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{player.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(player)}
                          className="h-8 w-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(player)}
                          className="h-8 w-8 text-destructive bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit player</DialogTitle>
            <DialogDescription>
              Update the player's name.
            </DialogDescription>
          </DialogHeader>
          <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Enter player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditPlayer} disabled={!playerName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete {selectedPlayer?.name} and remove them from all games.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlayer}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
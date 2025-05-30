"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useServiceTracking } from '@/hooks/useServiceTracking';

export default function GamesPage() {
  const { trackServiceUsage } = useServiceTracking();
  const [open, setOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gameMaxScore, setGameMaxScore] = useState<string>("");
  const [newGameMaxScore, setNewGameMaxScore] = useState<string>("");
  const [selectedGame, setSelectedGame] = useState<{ id: string; name: string; players: string[]; maxScore?: number } | null>(null);

  const {
    maxScore: currentMaxScore,
    setMaxScore: updateMaxScore,
    addGame,
    getGames,
    deleteGame,
    updateGame,
    players
  } = useStore();

  useEffect(() => {
    trackServiceUsage('Scorecard', 'page_view');
  }, []);

  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setMaxScore(value);
    }
  };

  const handleSaveMaxScore = () => {
    if (maxScore && !isNaN(parseInt(maxScore))) {
      updateMaxScore(parseInt(maxScore));
      trackServiceUsage('Scorecard', 'max_score_updated', `New max score: ${maxScore}`);
    }
  };

  const handleAddGame = () => {
    if (selectedPlayers.length === 0) return;
    const maxScoreValue = newGameMaxScore ? parseInt(newGameMaxScore) : undefined;
    addGame(gameName, selectedPlayers, maxScoreValue);
    trackServiceUsage('Scorecard', 'game_created', `Name: ${gameName}, Players: ${selectedPlayers.length}, Max Score: ${maxScoreValue || 'default'}`);
    setGameName("");
    setNewGameMaxScore("");
    setSelectedPlayers([]);
    setOpen(false);
  };

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(current =>
      current.includes(playerId)
        ? current.filter(id => id !== playerId)
        : [...current, playerId]
    );
  };

  const handleDeleteGame = () => {
    if (selectedGame) {
      trackServiceUsage('Scorecard', 'game_deleted', `Game: ${selectedGame.name}`);
      deleteGame(selectedGame.id);
      setSelectedGame(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditGame = () => {
    if (selectedGame && selectedPlayers.length > 0) {
      const maxScoreValue = gameMaxScore ? parseInt(gameMaxScore) : undefined;
      updateGame(selectedGame.id, gameName, selectedPlayers, maxScoreValue);
      trackServiceUsage('Scorecard', 'game_edited', `Game: ${gameName}, Players: ${selectedPlayers.length}, Max Score: ${maxScoreValue || 'default'}`);
      setGameName("");
      setGameMaxScore("");
      setSelectedPlayers([]);
      setSelectedGame(null);
      setEditDialogOpen(false);
    }
  };

  const openDeleteDialog = (game: { id: string; name: string; players: string[]; maxScore?: number }) => {
    setSelectedGame(game);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (game: { id: string; name: string; players: string[]; maxScore?: number }) => {
    setSelectedGame(game);
    setGameName(game.name);
    setGameMaxScore(game.maxScore?.toString() || "");
    setSelectedPlayers(game.players);
    setEditDialogOpen(true);
  };

  const games = getGames();

  return (
    <>
      <PageHeader
        title="Games"
        description="Configure game settings and create new games"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create a new game</DialogTitle>
                <DialogDescription>
                  Add a name and select players for your new game session.
                </DialogDescription>
              </DialogHeader>
              <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Game Name (optional)</Label>
                  <Input
                    id="name"
                    placeholder="Game Name"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newMaxScore">Max Score (optional)</Label>
                  <Input
                    id="newMaxScore"
                    placeholder={`Default: ${currentMaxScore}`}
                    value={newGameMaxScore}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setNewGameMaxScore(value);
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use the default max score ({currentMaxScore})
                  </p>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Select Players</Label>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="grid gap-4">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={player.id}
                            checked={selectedPlayers.includes(player.id)}
                            onCheckedChange={() => togglePlayer(player.id)}
                          />
                          <Label htmlFor={player.id} className="flex-1 cursor-pointer">
                            {player.name}
                          </Label>
                        </div>
                      ))}
                      {players.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No players available. Add players first.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddGame}
                  disabled={selectedPlayers.length === 0}
                >
                  Create Game
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Maximum Score</CardTitle>
            <CardDescription>
              Set the maximum score threshold for all games. When a player&apos;s total exceeds this, they&apos;re out!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="grid gap-2 flex-1">
                <Label htmlFor="maxScore">Maximum Score</Label>
                <Input
                  id="maxScore"
                  placeholder="Enter maximum score"
                  value={maxScore || currentMaxScore.toString()}
                  onChange={handleMaxScoreChange}
                />
              </div>
              <Button onClick={handleSaveMaxScore}>Save</Button>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Current maximum score: {currentMaxScore}
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Game History</h2>

          {games.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="font-medium">No games yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first game to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Card key={game.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{game.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Created {new Date(game.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(game)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(game)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground">
                      {game.players.length} players selected
                    </p>
                  </CardContent>
                  <CardFooter className="pt-3 border-t flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      ID: {game.id.slice(0, 8)}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/scorecard/play?gameId=${game.id}`}>Play</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit game</DialogTitle>
            <DialogDescription>
              Update the game name, max score, and players.
            </DialogDescription>
          </DialogHeader>
          <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Game Name (optional)</Label>
              <Input
                id="name"
                placeholder="Game Name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxScore">Max Score (optional)</Label>
              <Input
                id="maxScore"
                placeholder={`Default: ${currentMaxScore}`}
                value={gameMaxScore}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setGameMaxScore(value);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use the default max score ({currentMaxScore})
              </p>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label>Select Players</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="grid gap-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={player.id}
                        checked={selectedPlayers.includes(player.id)}
                        onCheckedChange={() => togglePlayer(player.id)}
                      />
                      <Label htmlFor={player.id} className="flex-1 cursor-pointer">
                        {player.name}
                      </Label>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No players available. Add players first.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditGame}
              disabled={selectedPlayers.length === 0}
            >
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
              This will permanently delete {selectedGame?.name} and all its associated scores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGame}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
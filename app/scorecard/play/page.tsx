"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Player } from "@/types";

function WinnerAnnouncement({
  player,
  getPlayerTotalScore
}: {
  player: Player;
  getPlayerTotalScore: (playerId: string) => number;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-yellow-200/50 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]">
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rotate-12 text-yellow-200/60">
        <Trophy className="h-full w-full" />
      </div>
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rotate-12 text-yellow-200/40">
        <Trophy className="h-full w-full" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 opacity-75 blur"></div>
            <Avatar className="relative h-20 w-20 border-2 border-yellow-400 shadow-lg">
              <AvatarImage src={player.avatarUrl} alt={player.name} />
              <AvatarFallback className="text-lg">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800">
              Winner!
            </div>
            <h3 className="text-3xl font-bold text-yellow-900">{player.name}</h3>
            <p className="text-lg text-yellow-700">
              Total Score: <span className="font-semibold">{getPlayerTotalScore(player.id)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams?.get("gameId") || null);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});

  const {
    games,
    players,
    maxScore,
    getGames,
    addScore,
    isPlayerGameOver,
    getPlayerTotalScore
  } = useStore();

  useEffect(() => {
    if (searchParams) {
      const gameId = searchParams.get("gameId");
      if (gameId) {
        setSelectedGameId(gameId);
      }
    }
  }, [searchParams]);

  const allGames = getGames();
  const selectedGame = selectedGameId ? games.find(g => g.id === selectedGameId) : null;

  const handleGameChange = (value: string) => {
    setSelectedGameId(value);
    setPlayerScores({});
    router.push(`/scorecard/play?gameId=${value}`);
  };

  const handleScoreChange = (playerId: string, value: string) => {
    // Convert empty string or "-" to 0, otherwise parse the number
    const numValue = value === "" || value === "-" ? 0 : Number(value);
    setPlayerScores({
      ...playerScores,
      [playerId]: numValue
    });
  };

  const handleSubmitScores = () => {
    if (!selectedGameId) return;

    Object.entries(playerScores).forEach(([playerId, score]) => {
      if (score !== 0) {  // Submit any non-zero score, including negative
        addScore(selectedGameId, playerId, score);
      }
    });

    // Reset scores input
    setPlayerScores({});
  };

  const gamePlayers = players
    .filter(p => selectedGame?.players.includes(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        title="Play Game"
        description="Track scores for your current game"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Selection</CardTitle>
            <CardDescription>
              Select a game to start tracking scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="gameSelect">Select Game</Label>
                <Select value={selectedGameId || ""} onValueChange={handleGameChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {allGames.length === 0 ? (
                      <SelectItem value="no-games\" disabled>
                        No games available
                      </SelectItem>
                    ) : (
                      allGames.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {!selectedGameId && (
                <div className="self-end">
                  <Button asChild variant="outline">
                    <a href="/">Create New Game</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          {selectedGame && (
            <CardFooter className="text-sm text-muted-foreground border-t pt-4">
              <div>
                Game: <span className="font-medium">{selectedGame.name}</span> •
                Max Score: <span className="font-medium">{selectedGame.maxScore ?? maxScore}</span>
              </div>
            </CardFooter>
          )}
        </Card>

        {!selectedGameId && players.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No games or players</AlertTitle>
            <AlertDescription>
              Create a game and add players to start tracking scores.
            </AlertDescription>
          </Alert>
        )}

        {selectedGameId && (
          <div className="space-y-6">
            {gamePlayers.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No players added</AlertTitle>
                <AlertDescription>
                  Add players to start tracking scores.
                </AlertDescription>
              </Alert>
            )}

            {gamePlayers.length > 0 && (
              <>
                {/* Winner Announcement */}
                {gamePlayers.filter(p => !isPlayerGameOver(p.id)).length === 1 && (
                  <WinnerAnnouncement
                    player={gamePlayers.find(p => !isPlayerGameOver(p.id))!}
                    getPlayerTotalScore={getPlayerTotalScore}
                  />
                )}

                {/* Active Players */}
                {gamePlayers.filter(p => !isPlayerGameOver(p.id)).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Players</CardTitle>
                      <CardDescription>
                        Players still in the game
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {gamePlayers
                        .filter(p => !isPlayerGameOver(p.id))
                        .map((player) => (
                          <div key={player.id} className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={player.avatarUrl} alt={player.name} />
                                <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{player.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Total: {getPlayerTotalScore(player.id)}
                              </div>
                            </div>
                            <div className="w-36">
                              <Input
                                type="number"
                                step="any"
                                placeholder="+/- Score"
                                value={playerScores[player.id] || ""}
                                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}

                {/* Game Over Players */}
                {gamePlayers.filter(p => isPlayerGameOver(p.id)).length > 0 && (
                  <Card className="border-destructive/10">
                    <CardHeader>
                      <CardTitle className="text-primary">Game Over Players</CardTitle>
                      <CardDescription>
                        Players who have exceeded the max score ({selectedGame?.maxScore ?? maxScore})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {gamePlayers
                        .filter(p => isPlayerGameOver(p.id))
                        .map((player) => (
                          <div key={player.id} className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border grayscale">
                                <AvatarImage src={player.avatarUrl} alt={player.name} />
                                <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <Badge variant="destructive" className="absolute -top-2 -right-2 text-[0.6rem] px-1 py-0">
                                Out
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-muted-foreground/90">{player.name}</div>
                              <div className="text-sm text-muted-foreground/90">
                                Total: {getPlayerTotalScore(player.id)}
                              </div>
                            </div>
                            <div className="w-36">
                              <Input
                                type="number"
                                step="any"
                                placeholder="+/- Score"
                                value={playerScores[player.id] || ""}
                                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSubmitScores}>
                    Record Scores
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}
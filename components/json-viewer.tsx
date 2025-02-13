interface TeamPlayer {
  player_name: string;
  team: 1 | 2;
  overall_rating: number;
}

interface TeamData {
  teams: TeamPlayer[];
}

interface JsonViewerProps {
  data: TeamData;
}

export function JsonViewer({ data }: JsonViewerProps) {
  return (
    <div className="mt-6 p-6 rounded-lg bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">AI Response</h3>
        <div className="text-xs text-gray-500">
          Teams Generated
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map(teamNum => {
          const teamPlayers = data.teams.filter((p: TeamPlayer) => p.team === teamNum);
          const avgRating = Math.round(
            teamPlayers.reduce((sum, p) => sum + p.overall_rating, 0) / teamPlayers.length
          );
          
          return (
            <div key={teamNum} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Team {teamNum}</h4>
                <span className="text-xs text-gray-500">
                  Avg Rating: {avgRating}
                </span>
              </div>
              
              <div className="space-y-2">
                {teamPlayers.map((player, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-2 rounded
                             bg-white border border-gray-100"
                  >
                    <span className="text-sm">{player.player_name}</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full
                                   bg-blue-50 text-blue-600">
                      {player.overall_rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
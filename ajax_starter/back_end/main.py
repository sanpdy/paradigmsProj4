from typing import List, Dict, Mapping, Any
from datetime import datetime
import os
from http_daemon import delay_open_url, serve_pages

# Define Player Class
class Player:
    def __init__(self, id: str) -> None:
        self.id = id
        self.x = 0
        self.y = 0
        self.known = 0

# Define a dictionary of Player objects and history for changes
players: Dict[str, Player] = {}
history: List[Mapping[str, Any]] = []

# Find Player by their ID
def findPlayer(id: str) -> Player:
    if id in players:
        # Player with the corresponding ID already exists
        return players[id]
    else:
        # Player with the corresponding ID doesn't exiss
        new_player = Player(id)
        players[id] = new_player
        return new_player

# Updates based on action keyword
def update(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    action = payload["action"]
    if action == "click":
        player = findPlayer(payload["id"])
        player.x = payload["x"]
        player.y = payload["y"]
        history.append({"id": player.id, "x": player.x, "y": player.y})
        return {
            "status": "success",
            "message": "Mouse click",
        }
    elif action == "updating":
        player = findPlayer(payload["id"])
        updates = history[player.known:]
        player.known = len(history) 
        return {
            "status": "success",
            "updates": updates,
        }
    elif action == "getTime":
        return {
            "status": "success",
            "server_time": datetime.now().isoformat()
        }
    return {
        "status": "error",
        "message": "Unknown"
    }



def main() -> None:
    # Get set up
    os.chdir(os.path.join(os.path.dirname(__file__), '../front_end'))
    # Serve pages
    port = 8987
    delay_open_url(f'http://localhost:{port}/game.html', .1)
    serve_pages(port, {
        'ajax.html': update,
    })

if __name__ == "__main__":
    main()

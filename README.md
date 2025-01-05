# Banana Quest
Real-time multiplayer sprite game enabling dynamic interactions and synchronized movements through client-server communication.


Technologies Used
Front End:

HTML5 Canvas for rendering game graphics.
JavaScript for client-side scripting.
AJAX for asynchronous communication with the server.
Back End:

Python for server-side logic.
HTTP Daemon for serving web pages and handling AJAX requests.
WebSocket for real-time communication between clients and the server.
Features
Real-Time Multiplayer Interaction:

Players can control their sprites using mouse clicks and keyboard inputs.
The server facilitates real-time updates, allowing players to see the movements of others.
Dynamic Sprite Movement:

Each sprite can move towards a destination point, responding to click events or keyboard inputs.
The movement is calculated based on a step size and direction, providing a smooth and dynamic experience.
Client-Server Communication:

AJAX requests handle communication between the client and server, enabling actions like sprite movement and updates.
WebSocket connections are used for real-time updates, ensuring minimal latency.
Sprite Rendering:

Game sprites are rendered on an HTML5 Canvas, creating an engaging visual experience.
The canvas is updated in real-time to reflect the positions of all active sprites.

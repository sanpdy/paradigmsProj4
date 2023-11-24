interface UpdateHandler {
	(): void;
}

interface OnClickHandler {
	(x:number, y:number): void;
}

class Sprite {

	x: number;
	y: number;
	id: any;
	speed: number;
	image: HTMLImageElement;
	update: UpdateHandler;
	onclick: OnClickHandler;
	dest_x: number | undefined;
	dest_y: number | undefined;

	constructor(x: number, y: number, image_url: string, update_method: UpdateHandler, onclick_method: OnClickHandler) {
		this.x = x;
		this.y = y;
		this.id = g_id;
        this.speed = 4;
		this.image = new Image();
		this.image.src = image_url;
		this.update = update_method;
		this.onclick = onclick_method;
	}

	set_destination(x: number, y: number) {
		
		this.dest_x = x;
		this.dest_y = y;
	}

	ignore_click(x: number, y: number) {
	}

	move(dx: number, dy: number) {
		this.dest_x = this.x + dx;
		this.dest_y = this.y + dy;
	}

	go_toward_destination() {
		if(this.dest_x === undefined)
			return;
		if(this.dest_y === undefined)
			return;

		let dist_remaining = Math.sqrt((this.dest_x - this.x) * (this.dest_x - this.x) + (this.dest_y - this.y) * (this.dest_y - this.y));
		let step_size = Math.min(5, dist_remaining);
		let angle = Math.atan2(this.dest_y - this.y, this.dest_x - this.x)
		this.x += step_size * Math.cos(angle);
		this.y += step_size * Math.sin(angle);
	}

	sit_still() {
	}

	calculateDistanceBasedOnDelay(timeDelay:number){
		const dpms = 5 / 40;  // Your step size: 5 pixels per 40 ms
		return dpms * timeDelay;
	}
	
}

let spritesArray: Sprite[];
class Model {
	player: Sprite;

	constructor() {
		spritesArray = [];
		this.player = new Sprite(50, 200, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
		spritesArray.push(this.player);
		httpPost('ajax.html', {
			id: g_id,
			action: 'click',
			x: this.player.x,
			y: this.player.y,
		}, () => {});
	}

	update() {
		for (const sprite of spritesArray) {
			sprite.update();
		}
	}

	onclick(x: number, y: number) {
		for (const sprite of spritesArray) {
			sprite.onclick(x, y);
		}
	}

	move(dx: number, dy: number) {
		this.player.move(dx, dy);
	}
}

class View
{
	model: Model;
	canvas: HTMLCanvasElement;
	
	constructor(model: Model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
	}

	update() {
		let ctx = this.canvas.getContext("2d");
		if(ctx)
		{
			ctx.clearRect(0, 0, 1000, 500);

			for (const sprite of spritesArray) {
					ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
			}
		}
	}
}

class Controller
{
	private model: Model;
	private view: View;
	private key_right: boolean = false;
	private key_left: boolean = false;
	private key_up: boolean = false;
	private key_down: boolean = false;

	constructor(model: Model, view: View) {
		this.model = model;
		this.view = view;
		this.key_right = false;
		this.key_left = false;
		this.key_up = false;
		this.key_down = false;
		let self = this;
		view.canvas.addEventListener("click", function(event: MouseEvent) { self.onClick(event); });
		document.addEventListener('keydown', function(event: KeyboardEvent) { self.keyDown(event); }, false);
		document.addEventListener('keyup', function(event: KeyboardEvent) { self.keyUp(event); }, false);
	}

	onAcknowledgeClick(ob: any) {
		console.log(`Response to move: ${JSON.stringify(ob)}`);
	}

	onClick(event: MouseEvent) {
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		httpPost('ajax.html', {
			id: g_id,
			action: 'click',
			x: x,
			y: y,
		}, this.onAcknowledgeClick);
	}

	keyDown(event: KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = true;
		else if(event.keyCode == 37) this.key_left = true;
		else if(event.keyCode == 38) this.key_up = true;
		else if(event.keyCode == 40) this.key_down = true;
	}

	keyUp(event: KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = false;
		else if(event.keyCode == 37) this.key_left = false;
		else if(event.keyCode == 38) this.key_up = false;
		else if(event.keyCode == 40) this.key_down = false;
	}

	update() {
		let dx = 0;
		let dy = 0;
        let speed = this.model.player.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);
	}
}

class Game {
	model: Model;
	view: View;
	controller: Controller;

	constructor() {
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}

interface HttpPostCallback {
	(x:any): any;
}

const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);

// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
const httpPost = (page_name: string, payload: any, callback: HttpPostCallback) => {
	let request = new XMLHttpRequest();
	request.onreadystatechange = () => {
		if(request.readyState === 4)
		{
			if(request.status === 200) {
				let response_obj;
				try {
					response_obj = JSON.parse(request.responseText);
				} catch(err) {}
				if (response_obj) {
					callback(response_obj);
				} else {
					callback({
						status: 'error',
						message: 'response is not valid JSON',
						response: request.responseText,
					});
				}
			} else {
				if(request.status === 0 && request.statusText.length === 0) {
					callback({
						status: 'error',
						message: 'connection failed',
					});
				} else {
					callback({
						status: 'error',
						message: `server returned status ${request.status}: ${request.statusText}`,
					});
				}
			}
		}
	};
	request.open('post', `${g_origin}/${page_name}`, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify(payload));
}

const onAcknowledgeUpdate = (ob: any) => {
    console.log(`Response to update: ${JSON.stringify(ob)}`);

    if (ob.status === "success" && Array.isArray(ob.updates)) {
        for (const update of ob.updates) {
            
            let sprite: Sprite | null = null;

			for (let i = 0; i < spritesArray.length; i++) {
				if (spritesArray[i].id === update.id) {
					sprite = spritesArray[i];
					break;
				}
			}
            if (sprite) {
            
                // Use the `move` function to adjust the sprite's position based on the delay
                const elapsedDistance = sprite.calculateDistanceBasedOnDelay(serverTimeOffset);
                const angle = Math.atan2(update.y - sprite.y, update.x - sprite.x);
                sprite.move(elapsedDistance * Math.cos(angle), elapsedDistance * Math.sin(angle));

                sprite.set_destination(update.x, update.y);

            } else {
                const newSprite = new Sprite(update.x, update.y, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
                newSprite.id = update.id;
                spritesArray.push(newSprite);
            }

        }
    } else {
        console.error(`Failed to process updates:", ${JSON.stringify(ob)}`);
    }
}

const request_updates = () => {
    httpPost('ajax.html', {
        action: 'updating',
        id: g_id
    }, onAcknowledgeUpdate);
};

let serverTimeOffset = 0;

const request_server_time = () => {
    httpPost('ajax.html', { action: 'getTime' }, (response) => {
        if (response.status === "success") {
			console.log(`Response to update: ${JSON.stringify(response)}`);
            const serverTime = new Date(response.server_time).getTime();
            const clientTime = Date.now();
            serverTimeOffset = serverTime - clientTime;
        } else {
            console.error("Failed to fetch server time:", response.message);
        }
    });
}

let last_updates_request_time = 0;

setInterval(() => {
    const time = Date.now();
    if (time - last_updates_request_time >= 500) { 
        last_updates_request_time = time;
        request_updates();
		request_server_time();
    }
}, 500);

let game = new Game();
let timer = setInterval(() => { game.onTimer() }, 40);
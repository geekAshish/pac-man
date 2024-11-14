import "./style.css";
import pipeHorizontal from "./assets/pipeHorizontal.png";
import pipeVertical from "./assets/pipeVertical.png";
import corner1 from "./assets/pipeCorner1.png";
import corner2 from "./assets/pipeCorner2.png";
import corner3 from "./assets/pipeCorner3.png";
import corner4 from "./assets/pipeCorner4.png";
import block from "./assets/block.png";
import capTop from "./assets/capTop.png";
import capLeft from "./assets/capLeft.png";
import capRight from "./assets/capRight.png";
import capBottom from "./assets/capBottom.png";
import pipeCross from "./assets/pipeCross.png";
import pipeConnectorTop from "./assets/pipeConnectorTop.png";
import pipeConnectorLeft from "./assets/pipeConnectorLeft.png";
import pipeConnectorRight from "./assets/pipeConnectorRight.png";
import pipeConnectorBottom from "./assets/pipeConnectorBottom.png";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;
canvas.style.backgroundColor = "black";

// Interface
interface Position {
  x: number;
  y: number;
}
interface Velocity {
  x: number;
  y: number;
}
interface Keys {
  w: {
    pressed: boolean;
  };
  a: {
    pressed: boolean;
  };
  s: {
    pressed: boolean;
  };
  d: {
    pressed: boolean;
  };
}

// constant data
const map: string[][] = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", "p", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

const createImage = (src: string) => {
  const image = new Image();
  image.src = src;
  return image;
};

const boundaries: Boundary[] = [];
const pellets: Pellets[] = [];
const keys: Keys = {
  w: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
};
let lastKey: string = "";
const playerVelocity = 5;
let score = 10;

class Boundary {
  position: Position;
  width: number;
  height: number;
  image: HTMLImageElement;

  static width: number = 40;
  static height: number = 40;

  constructor({
    position,
    image,
  }: {
    position: Position;
    image: HTMLImageElement;
  }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }

  draw() {
    // ctx!.fillStyle = "blue";
    // ctx!.fillRect(this.position.x, this.position.y, this.width, this.height);

    // drawing image instead of rectangle
    ctx!.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Player {
  position: Position;
  velocity: Velocity;
  radius: number;

  constructor({
    position,
    velocity,
    radius,
  }: {
    position: Position;
    velocity: Velocity;
    radius: number;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
  }

  draw() {
    ctx!.beginPath();
    ctx!.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx!.fillStyle = "yellow";
    ctx!.fill();
    ctx!.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
class Ghost {
  position: Position;
  velocity: Velocity;
  radius: number;
  color: string;
  prevCollisions: string[]

  constructor({
    position,
    velocity,
    radius,
    color
  }: {
    position: Position;
    velocity: Velocity;
    radius: number;
    color: string
  }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.prevCollisions = [];
  }

  draw() {
    ctx!.beginPath();
    ctx!.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx!.fillStyle = this.color;
    ctx!.fill();
    ctx!.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellets {
  position: Position;
  radius: number;

  constructor({ position, radius }: { position: Position; radius: number }) {
    this.position = position;
    this.radius = radius;
  }

  draw() {
    ctx!.beginPath();
    ctx!.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx!.fillStyle = "white";
    ctx!.fill();
    ctx!.closePath();
  }
}

const player = new Player({
  position: { x: Boundary.width * 1.5, y: Boundary.height * 1.5 },
  velocity: { x: 0, y: 0 },
  radius: 15,
});

const ghosts = [
  new Ghost(
    {
      position: {
        x: Boundary.width * 6.5,
        y: Boundary.height * 1.5
      },
      velocity: {
        x: playerVelocity, y: 0
      },
      radius: 15,
      color: 'red'
    }
  )
]

// creating boundary object
map?.forEach((row, i) => {
  row?.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(pipeHorizontal),
          })
        );
        break;
      case "|":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(pipeVertical),
          })
        );
        break;
      case "1":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(corner1),
          })
        );
        break;
      case "2":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(corner2),
          })
        );
        break;
      case "3":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(corner3),
          })
        );
        break;
      case "4":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(corner4),
          })
        );
        break;
      case "b":
        boundaries?.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage(block),
          })
        );
        break;

      case "[":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage(capLeft),
          })
        );
        break;
      case "]":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage(capRight),
          })
        );
        break;
      case "_":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage(capBottom),
          })
        );
        break;
      case "^":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage(capTop),
          })
        );
        break;
      case "+":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage(pipeCross),
          })
        );
        break;
      case "5":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            // color: "blue",
            image: createImage(pipeConnectorTop),
          })
        );
        break;
      case "6":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            // color: "blue",
            image: createImage(pipeConnectorRight),
          })
        );
        break;
      case "7":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            // color: "blue",
            image: createImage(pipeConnectorBottom),
          })
        );
        break;
      case "8":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage(pipeConnectorLeft),
          })
        );
        break;
      case ".":
        pellets.push(
          new Pellets({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
            radius: 3,
          })
        );
        break;
    }
  });
});

const circleCollidesWithRectangle = ({ circle, rectangle }: any) => {
  const padding = Boundary.width / 2 - circle.radius - 1;

  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
};

function animate() {
  requestAnimationFrame(animate);

  // clearing canvas
  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey === "w") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: -playerVelocity,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -playerVelocity;
      }
    }
  } else if (keys.a.pressed && lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: -playerVelocity,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -playerVelocity;
      }
    }
  } else if (keys.s.pressed && lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: playerVelocity,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = playerVelocity;
      }
    }
  } else if (keys.d.pressed && lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: playerVelocity,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = playerVelocity;
      }
    }
  }

  // Removing pellets : it will create blink
  // pellets?.forEach((pellet, i) => {
  //   pellet.draw();
  //   if (
  //     Math.hypot(pellet?.position.x - player?.position.x,
  //       pellet?.position.y - player?.position.y) < 
  //       pellet?.radius + player?.radius
  //     ) {
  //     pellets?.splice(i, 1);
  //   }
  // });

  // Removing pellets : going backword we don't cause rendering issue
  for (let i = pellets.length-1; 0 < i; i--) {
    const pellet = pellets[i];
    pellet.draw();
    if (
      Math.hypot(pellet?.position.x - player?.position.x,
        pellet?.position.y - player?.position.y) < 
        pellet?.radius + player?.radius
      ) {
      pellets?.splice(i, 1);
      console.log("Score: ", score += 10);
      
    }
  }

  // creating boundaries
  boundaries?.forEach((boundary) => {
    boundary.draw();

    // collision detection between player and boundary
    // adding player velocity so that after collision our object don't get stuck
    if (circleCollidesWithRectangle({ circle: player, rectangle: boundary })) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });

  // drawing and update player
  player.update();

  // drawing ghost
  ghosts?.forEach((ghost) => {
    ghost?.update();

    let collisions: string[] = [];

    // detecting collision between ghost and boundries
    boundaries?.forEach((boundary) => {
      if (
        !collisions?.includes('right') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: playerVelocity,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions?.push('right');
      }
      if (
        !collisions?.includes('left') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: -playerVelocity,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions?.push('left');
      }
      if (
        !collisions?.includes('up') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: -playerVelocity,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions?.push('up');
      }
      if (
        !collisions?.includes('down') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: playerVelocity,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions?.push('down');
      }

      console.log('here is : ', collisions);
      

      console.log("this is cur and prev", collisions.length, ghost.prevCollisions.length);
      if (collisions.length > ghost.prevCollisions.length) {
        ghost.prevCollisions = collisions;
      }
      console.log("this is cur and prev", collisions.length, ghost.prevCollisions.length);


      // because two arrays are never gonna different
      // we've to stringify this
      if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
        
        if (ghost.velocity.x > 0 ) {
          ghost.prevCollisions.push('right')
        } else if (ghost.velocity.x < 0 ) {
          ghost.prevCollisions.push('left')
        } else if (ghost.velocity.y > 0 ) {
          ghost.prevCollisions.push('down')
        } else if (ghost.velocity.y < 0 ) {
          ghost.prevCollisions.push('up')
        }

        const pathways = ghost.prevCollisions.filter((collision) => {
          console.log(collisions, collision, collisions.includes(collision));
          return !collisions.includes(collision)
          
        })
        console.log(pathways);
        
        const direction = pathways[Math.floor(Math.random() * pathways.length)];
        

        switch (direction) {
          case 'down':
            ghost.velocity.y = playerVelocity;
            ghost.velocity.x = 0;
            break;
          case 'up':
            ghost.velocity.y = -playerVelocity;
            ghost.velocity.x = 0;
            break;
          case 'left':
            ghost.velocity.y = 0;
            ghost.velocity.x = -playerVelocity;
            break;
          case 'right':
            ghost.velocity.y = 0;
            ghost.velocity.x = playerVelocity;
            break;
        }

        ghost.prevCollisions = [];
      }
    })
  })
}

animate();

// Eventlistener
addEventListener("keydown", ({ key }) => {
  switch (key) {
    // case "w": // changing velocity like that will cause key overlap if we press two key at a same time, to solve this we create a key press object and track our key is pressed or not
    //   player.velocity.x = 5;
    //   break;
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;

    default:
      break;
  }
});
addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;

    default:
      break;
  }
});

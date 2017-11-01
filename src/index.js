// for async/await support via babel
import "regenerator-runtime/runtime";

const container = document.querySelector("#container");
const loader = document.querySelector("#loader");

loader.classList.add("hide");

import { World } from "./world";

import Input from "./lib/input";

const CAMERA_ZOOM_SPEED = 0.1;
const CAMERA_MIN_DISTANCE = 15;
const CAMERA_MAX_DISTANCE = 60;

class Game {
  constructor(container) {
    this.world = new World();
    window.addEventListener("resize", () => {
      this.world.fitToScreen();
    });

    requestAnimationFrame(this.animationFrame.bind(this));
    
    container.appendChild(this.world.renderer.domElement);

    Input.on("scrollup", distance => {
      let newDist = this.world.distance + this.world.distance * CAMERA_ZOOM_SPEED;
      if(newDist < CAMERA_MIN_DISTANCE) {
        newDist = CAMERA_MIN_DISTANCE;
      }
      if(newDist > CAMERA_MAX_DISTANCE) {
        newDist = CAMERA_MAX_DISTANCE;
      }
      this.world.distance = newDist;
    });
    Input.on("scrolldown", distance => {
      let newDist = this.world.distance - this.world.distance * CAMERA_ZOOM_SPEED;
      if(newDist < CAMERA_MIN_DISTANCE) {
        newDist = CAMERA_MIN_DISTANCE;
      }
      if(newDist > CAMERA_MAX_DISTANCE) {
        newDist = CAMERA_MAX_DISTANCE;
      }
      this.world.distance = newDist;
    });
    Input.on("rotateRightPress", () => {
      this.world.rotateCamera(1);
    });
    Input.on("rotateLeftPress", () => {
      this.world.rotateCamera(-1);
    });
  }

 animationFrame(dt) {
    requestAnimationFrame(this.animationFrame.bind(this));
    
    this.world.animationFrame(dt);
  }
}

async function setupFeatherIcons() {
  if(window.feather) {
    window.feather.replace();
  }
  else {
    await new Promise(resolve => {
      document.getElementById("feather-script").addEventListener("load", resolve);
    });
    window.feather.replace();
  }
}

let game = new Game(container);

window.gameDebug = game;

setupFeatherIcons();
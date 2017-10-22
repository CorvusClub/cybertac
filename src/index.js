// for async/await support via babel
import "regenerator-runtime/runtime";

const container = document.querySelector("#container");
const loader = document.querySelector("#loader");

loader.classList.add("hide");

import { World } from "./world";

let world = new World();

window.addEventListener("resize", function() {
  world.fitToScreen();
});

import {
  BoxGeometry,
  MeshBasicMaterial,
  Mesh
} from "three";

let cube;
function buildEnvironment() {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({color: 0xff0000});
  cube = new Mesh(geometry, material);

  world.scene.add(cube);

  world.camera.position.z = 5;
}

function animationFrame(dt) {
  requestAnimationFrame(animationFrame);

  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;
  
  world.animationFrame(dt);
}


buildEnvironment();

requestAnimationFrame(animationFrame);

container.appendChild(world.renderer.domElement);
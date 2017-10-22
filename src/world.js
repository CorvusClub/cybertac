import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from "three";

class World {
  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new WebGLRenderer();

    this.fitToScreen();
  }

  fitToScreen() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
  }

  animationFrame(dt) {
    this.renderer.render(this.scene, this.camera);
  }
}

export {World};
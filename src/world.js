import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  BoxGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Mesh,
  Cylindrical,
  Vector3,
} from "three";

import { Easing, Interpolation, Tween, autoPlay as autoPlayTweenAnimations } from 'es6-tween/src/index.lite';

autoPlayTweenAnimations(true);

const ISO_ANGLE = Math.atan2(1, 1);
const ISO_CAMERA_RADIUS = 1 / Math.cos(ISO_ANGLE);

const GRID_UNIT_SIZE = 10;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 5;

class World {
  constructor() {
    this.scene = new Scene();
    let aspect = window.innerWidth / window.innerHeight;
    let distance = 20;
    this.camera = new OrthographicCamera( -distance * aspect, distance * aspect, distance, -distance, 1, 1000 );

    this.angle = 0;
    this.distance = 40;

    this.renderer = new WebGLRenderer({canvas: document.querySelector("#display")});

    window.addEventListener("resize",  () => this.fitToScreen());
    this.fitToScreen();

    this.buildObjects();
  }

  get distance() {
    return this._distance;
  }

  set distance(distance) {
    this._distance = distance;
    let aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -distance * aspect;
    this.camera.right = distance * aspect;
    this.camera.top = distance;
    this.camera.bottom = -distance;
    this.updateCameraProjection();
  }

  set cameraAngle(angle) {
    this.angle = angle;
    this.updateCameraProjection();
  }
  get cameraAngle() {
    return this.angle;
  }

  translateGridPosToWorldPos(gridPos) {
    let gridCenterOffset = GRID_UNIT_SIZE / 2;
    let worldX = gridPos.x * GRID_UNIT_SIZE + gridCenterOffset;
    let worldY = gridPos.y * GRID_UNIT_SIZE + gridCenterOffset;

    let widthOffset = (GRID_WIDTH * GRID_UNIT_SIZE) / 2;
    let heightOffset = (GRID_HEIGHT * GRID_UNIT_SIZE) / 2;

    let translatedX = worldX - widthOffset;
    let translatedY = worldY - heightOffset;

    return new Vector3(
      translatedY,
      GRID_UNIT_SIZE / 2,
      -translatedX,
    );
  }

  updateCameraAspect() {
    this.distance = this.distance; // recalculate aspect ratio
  }

  updateCameraProjection() {
    let cameraPos = new Cylindrical(ISO_CAMERA_RADIUS * this.distance, ISO_ANGLE + this.angle, this.distance);
    this.camera.position.setFromCylindrical(cameraPos);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt( this.scene.position );
  }

  rotateCamera(direction) {
    if(this.cameraTween && this.cameraTween.isPlaying()) {
      if(!this.cameraTween.queued) {
        this.cameraTween.onComplete(() => {
          this.rotateCamera(direction);
        });
        this.cameraTween.queued = true;
      }
      return;
    }
    let cameraAngle = this.cameraAngle + (ISO_ANGLE * 2) * direction;
    this.cameraTween = new Tween(this).to({cameraAngle}, 500).start();
  }

  buildObjects() {
    const gridGeometry = new PlaneGeometry(GRID_UNIT_SIZE * GRID_WIDTH, GRID_UNIT_SIZE * GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT);
    const gridMaterial = new MeshBasicMaterial({color: 0x00cc00, wireframe: true, transparent: true, opacity: 0.3});
    
    this.grid = new Mesh(gridGeometry, gridMaterial);
    this.grid.rotation.order = 'YXZ';
    this.grid.rotation.y = - Math.PI / 2;
    this.grid.rotation.x = - Math.PI / 2;

    const cubeGeometry = new BoxGeometry( 10, 10, 10 );
    const cubeMaterial = new MeshNormalMaterial();

    const cube = new Mesh( cubeGeometry, cubeMaterial );
    let topLeft = this.translateGridPosToWorldPos({x: 0, y: 0})
    cube.position.copy(topLeft);


    this.scene.add(this.grid);
    this.scene.add(cube);
    this.cube = cube;
  }

  fitToScreen() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.updateCameraAspect();
  }

  animationFrame(dt) {
    this.renderer.render(this.scene, this.camera);
  }
}

export {World};
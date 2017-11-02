import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  BoxGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Mesh,
  HemisphereLight,
  Cylindrical,
  Vector3,
  Raycaster,
} from "three";

import OBJLoader from "./vendor/OBJLoader.js";
import MTLLoader from "./vendor/MTLLoader.js";

import { Easing, Interpolation, Tween, autoPlay as autoPlayTweenAnimations } from 'es6-tween/src/index.lite';

autoPlayTweenAnimations(true);

const ISO_ANGLE = Math.atan2(1, 1);
const ISO_CAMERA_RADIUS = 1 / Math.cos(ISO_ANGLE);

const GRID_UNIT_SIZE = 10;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

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
  translateWorldPosToGridPos(worldPos) {
    let gridCenterOffset = GRID_UNIT_SIZE / 2;
    let widthOffset = (GRID_WIDTH * GRID_UNIT_SIZE) / 2;
    let heightOffset = (GRID_HEIGHT * GRID_UNIT_SIZE) / 2;

    let x = worldPos.z * -1;
    let y = worldPos.x;

    x += widthOffset;
    y += heightOffset;

    x = Math.floor(x / GRID_UNIT_SIZE);
    y = Math.floor(y / GRID_UNIT_SIZE);

    return {x, y};
  }

  getWorldPosFromMousePos(mouseX, mouseY) {
    let mouseVector = new Vector3();
    mouseVector.x = 2 * (mouseX / this.renderer.domElement.width) - 1;
    mouseVector.y = 1 - 2 * (mouseY / this.renderer.domElement.height);

    let raycaster = new Raycaster();
    raycaster.setFromCamera(mouseVector, this.camera);
    let intersection = raycaster.intersectObjects([this.grid]);
    if(intersection.length === 0) {
      return false;
    }
    return intersection[0].point;
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
    let topLeft = this.translateGridPosToWorldPos({x: GRID_WIDTH / 2, y: GRID_HEIGHT / 2})
    cube.position.copy(topLeft);


    let light = new HemisphereLight( 0x404040, 0xddd384, 2 ); // soft green light
    this.scene.add( light );

    this.scene.add(this.grid);
    this.scene.add(cube);
    this.cube = cube;


    let objLoader = new OBJLoader();
    let mtlLoader = new MTLLoader();
    mtlLoader.setPath("./assets/");
    objLoader.setPath("./assets/");

    mtlLoader.load("Lighthouse singly.mtl", materials => {
      materials.preload();
      objLoader.setMaterials(materials);

      objLoader.load(
        "Lighthouse singly.obj",
        object => {
          object.children[0].position.setY(-3);
          object.position.copy(this.translateGridPosToWorldPos({x: 3, y: 3}));
          this.scene.add(object);
        },
      );
    });
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
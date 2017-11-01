import EventEmitter from 'events';

class InputManager extends EventEmitter {
  constructor() {
    super();
    
    document.body.addEventListener("keydown", event => this.onKeyDown(event));
    document.body.addEventListener("keyup", event => this.onKeyUp(event));
    document.body.addEventListener("mousedown", event => this.onMouseDown(event));
    document.body.addEventListener("wheel", event => this.onScroll(event));
    document.getElementById("display").addEventListener("mouseup", event => this.onMouseUp(event));
    document.getElementById("display").addEventListener("mousemove", event => this.onMouseMove(event));
    
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    
    this.on("upPressed", () => this.up = true);
    this.on("upReleased", () => this.up = false);
    this.on("downPressed", () => this.down = true);
    this.on("downReleased", () => this.down = false);
    this.on("leftPressed", () => this.left = true);
    this.on("leftReleased", () => this.left = false);
    this.on("rightPressed", () => this.right = true);
    this.on("rightReleased", () => this.right = false);
    this.on("mousedown", () => this.mousedown = true);
    this.on("mouseup", () => this.mousedown = false);

    document.getElementById("rotateLeft").addEventListener("click", () => this.emit("rotateLeftPress"));
    document.getElementById("rotateRight").addEventListener("click", () => this.emit("rotateRightPress"));
  }
  
  onKeyDown(event) {
    if(event.keyCode === 87 || event.keyCode === 38 || event.keyCode === 80 || event.keyCode === 188) {
      this.emit("upPressed");
    }
    if(event.keyCode === 83 || event.keyCode === 40 || event.keyCode === 79) {
      this.emit("downPressed");
    }
    if(event.keyCode === 65 || event.keyCode === 37 || event.keyCode === 81) {
      this.emit("leftPressed");
    }
    if(event.keyCode === 68 || event.keyCode === 39 || event.keyCode === 69) {
      this.emit("rightPressed");
    }
    console.log(event.keyCode);
    // q
    if(event.keyCode === 81) {
      this.emit("rotateLeftPress");
    }
    // e
    if(event.keyCode === 69) {
      this.emit("rotateRightPress");
    }
  }
  
  onKeyUp(event) {
    if(this.up && (event.keyCode === 87 || event.keyCode === 38 || event.keyCode === 80 || event.keyCode === 188)) {
      this.emit("upReleased");
    }
    if(this.down && (event.keyCode === 83 || event.keyCode === 40 || event.keyCode === 79)) {
      this.emit("downReleased");
    }
    if(this.left && (event.keyCode === 65 || event.keyCode === 37 || event.keyCode === 81)) {
      this.emit("leftReleased");
    }
    if(this.right && (event.keyCode === 68 || event.keyCode === 39 || event.keyCode === 69)) {
      this.emit("rightReleased");
    }
    // q
    if(event.keyCode === 81) {
      this.emit("rotateLeftReleased");
    }
    // e
    if(event.keyCode === 69) {
      this.emit("rotateRightReleased");
    }
  }
  
  onMouseDown(event) {
    this.emit("mousedown");
  }
  onMouseUp(event) {
    this.emit("mouseup");
  }
  onMouseMove(e) {
    var target = e.target || e.srcElement,
      rect = target.getBoundingClientRect(),
      offsetX = e.clientX - rect.left,
      offsetY = e.clientY - rect.top;
      
    this.mouseX = offsetX;
    this.mouseY = offsetY;
    
    this.emit("mousemove");
  }
  onScroll(event) {
    var diff = event.deltaY;
    if(diff > 0) {
      this.emit("scrollup", diff);
    }
    if(diff < 0) {
      this.emit("scrolldown", -diff);
    }
  }
}

const inputInstance = new InputManager();

export default inputInstance;
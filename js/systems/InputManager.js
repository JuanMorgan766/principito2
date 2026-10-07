export class InputManager {
  constructor() {
    this.keys = new Set();
    this.pressedKeys = new Set();
    this.controlKeys = new Set([
      "a",
      "d",
      "arrowleft",
      "arrowright",
      "arrowdown",
      "s",
      "w",
      "arrowup",
      " ",
      "j",
      "e",
      "enter",
      "escape",
    ]);
    this.touchControls = { left: false, right: false, up: false, crouch: false };

    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (this.controlKeys.has(key)) {
      event.preventDefault();
    }

    if (!this.keys.has(key)) {
      this.pressedKeys.add(key);
    }

    this.keys.add(key);
  }

  handleKeyUp(event) {
    this.keys.delete(event.key.toLowerCase());
  }

  getHorizontalDirection() {
    const movesLeft = this.keys.has("a") || this.keys.has("arrowleft") || this.touchControls.left;
    const movesRight = this.keys.has("d") || this.keys.has("arrowright") || this.touchControls.right;

    return Number(movesRight) - Number(movesLeft);
  }

  getVerticalDirection() {
    const movesUp = this.keys.has("w") || this.keys.has("arrowup") || this.keys.has(" ") || this.touchControls.up;
    const movesDown = this.keys.has("s") || this.keys.has("arrowdown");
    return Number(movesDown) - Number(movesUp);
  }

  isCrouching() {
    return this.keys.has("s") || this.keys.has("arrowdown") || this.touchControls.crouch;
  }

  consumeJump() {
    const jumpKeys = [" ", "w", "arrowup", "touch-jump"];
    const jumpKey = jumpKeys.find((key) => this.pressedKeys.has(key));

    if (!jumpKey) {
      return false;
    }

    this.pressedKeys.delete(jumpKey);
    return true;
  }

  consumeAttack() {
    return this.consumePressedKey(["j", "touch-attack"]);
  }

  consumeInteract() {
    return this.consumePressedKey(["e"]);
  }

  consumeContinue() {
    return this.consumePressedKey(["enter", "touch-enter"]);
  }

  consumeEnter() {
    return this.consumePressedKey(["enter", "touch-enter"]);
  }

  consumePause() {
    return this.consumePressedKey(["escape", "touch-pause"]);
  }

  bindTouchControls(root) {
    let lastTouchEnd = null;
    root.addEventListener("touchstart", (event) => {
      // Cancelar desde el inicio evita que WebKit interprete dos toques rápidos como zoom.
      if (event.cancelable) event.preventDefault();
    }, { passive: false });
    root.addEventListener("touchmove", (event) => {
      if (event.touches?.length > 1 && event.cancelable) event.preventDefault();
    }, { passive: false });
    root.addEventListener("touchend", (event) => {
      const currentTouchEnd = event.timeStamp;
      if (lastTouchEnd !== null && currentTouchEnd - lastTouchEnd < 350 && event.cancelable) {
        event.preventDefault();
      }
      lastTouchEnd = currentTouchEnd;
    }, { passive: false });
    ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
      root.addEventListener(eventName, (event) => event.preventDefault(), { passive: false });
    });
    root.addEventListener("dblclick", (event) => {
      if (window.matchMedia?.("(pointer: coarse)").matches) event.preventDefault();
    }, { passive: false });

    root.querySelectorAll("[data-control]").forEach((button) => {
      const control = button.dataset.control;
      ["contextmenu", "selectstart", "dragstart"].forEach((eventName) => {
        button.addEventListener(eventName, (event) => event.preventDefault());
      });
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        this.activateTouchControl(control);
      });

      ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
        button.addEventListener(eventName, () => this.releaseTouchControl(control));
      });
    });
  }

  activateTouchControl(control) {
    if (control === "left" || control === "right") {
      this.touchControls[control] = true;
      return;
    }
    if (control === "crouch") {
      this.touchControls.crouch = true;
      return;
    }

    const pressedControl = {
      jump: "touch-jump",
      attack: "touch-attack",
      pause: "touch-pause",
      enter: "touch-enter",
    }[control];

    if (pressedControl) this.pressedKeys.add(pressedControl);
    if (control === "jump") this.touchControls.up = true;
  }

  releaseTouchControl(control) {
    if (control === "left" || control === "right") this.touchControls[control] = false;
    if (control === "crouch") this.touchControls.crouch = false;
    if (control === "jump") this.touchControls.up = false;
  }

  clearTouchMovement() {
    this.touchControls.left = false;
    this.touchControls.right = false;
    this.touchControls.up = false;
    this.touchControls.crouch = false;
  }

  consumePressedKey(keys) {
    const key = keys.find((candidate) => this.pressedKeys.has(candidate));

    if (!key) {
      return false;
    }

    this.pressedKeys.delete(key);
    return true;
  }
}

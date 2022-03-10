import { Vector3 } from 'three';

export interface CoordinatesShakeProps {
  startCoordinates: Vector3;
  shakesPerSecond: number;
  amplitude: number;
}

export class CoordinatesShake {
  startCoordinates: Vector3;
  currentCoordinates: Vector3;
  amplitude: number;
  maxShakeDelay: number;
  currentShakeDelay: number;

  constructor(props: CoordinatesShakeProps) {
    this.startCoordinates = props.startCoordinates.clone();
    this.currentCoordinates = this.startCoordinates.clone();
    this.amplitude = props.amplitude;
    this.maxShakeDelay = this.getMaxShakeDelay(props.shakesPerSecond);
    this.currentShakeDelay = 0;
  }

  getCurrentCoordinates() {
    return this.currentCoordinates;
  }

  updateShakesPerSecond(shakesPerSecond: number) {
    this.maxShakeDelay = this.getMaxShakeDelay(shakesPerSecond);
  }

  getMaxShakeDelay(shakesPerSecond: number) {
    return this.maxShakeDelay = 1 / shakesPerSecond;
  }

  update(delta: number) {
    this.currentShakeDelay += delta;
    if (this.currentShakeDelay >= this.maxShakeDelay) {
      this.currentShakeDelay = 0;
      this.currentCoordinates.set(
        -Math.random() * this.amplitude + this.startCoordinates.x,
        -Math.random() * this.amplitude + this.startCoordinates.y,
        -Math.random() * this.amplitude + this.startCoordinates.z,
      );
    }
  }
}

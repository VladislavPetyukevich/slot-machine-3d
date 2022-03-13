import {
  Scene,
  PerspectiveCamera,
} from 'three';

export interface BasicSceneProps {
  renderWidth: number;
  renderHeight: number;
};

export class BasicScene {
  scene: Scene;
  camera: PerspectiveCamera;

  constructor(props: BasicSceneProps) {
    this.scene = new Scene();
    const fov = 50;
    this.camera = new PerspectiveCamera(fov, props.renderWidth / props.renderHeight, 0.1, 1000);
  }
  update(delta: number) { }
}

import {
  PlaneGeometry,
  Mesh,
  PointLight,
  Matrix4,
  MeshLambertMaterial,
  Vector2,
  Vector3,
  Fog,
  AmbientLight,
  RepeatWrapping,
  Color,
  CylinderGeometry,
  PerspectiveCamera,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';

export interface TestSceneProps extends BasicSceneProps {
}

export class TestScene extends BasicScene {
  cylinder1: Mesh;

  constructor(props: TestSceneProps) {
    super(props);
    this.cylinder1 = new Mesh(
      new CylinderGeometry(),
      new MeshBasicMaterial({ wireframe: true, color: 0x00ff00 }),
    )
    this.cylinder1.rotation.x = Math.PI / 2;
    this.cylinder1.rotation.z = Math.PI / 2;
    this.scene.add(this.cylinder1);
    this.camera.position.z = 5;
  }

  update(delta: number) {
    this.cylinder1.rotateY(-delta * 1);
  }
}

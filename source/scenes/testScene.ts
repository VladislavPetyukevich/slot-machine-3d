import {
  Mesh,
  CylinderGeometry,
  BoxGeometry,
  MeshLambertMaterial,
  TextureLoader,
  AmbientLight,
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import slotBackground from '@/assets/slot.png';

export interface TestSceneProps extends BasicSceneProps {
}

const loader = new TextureLoader();

export class TestScene extends BasicScene {
  cylinder1: Mesh;
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;

  constructor(props: TestSceneProps) {
    super(props);

    this.ambientLightColor = 0xFFFFFF;
    this.ambientLightIntensity = 7;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    this.cylinder1 = new Mesh(
      new CylinderGeometry(),
      new MeshLambertMaterial({ wireframe: true, color: 0x00ff00 }),
    );
    this.cylinder1.rotation.x = Math.PI / 2;
    this.cylinder1.rotation.z = Math.PI / 2;
    this.scene.add(this.cylinder1);
    this.camera.position.z = 5;

    loader.load(
      slotBackground,
      (texture) => {
        const geometry = new BoxGeometry(12, 8, 0.1)
        const material = new MeshLambertMaterial({
          map: texture,
        });
        this.scene.add(new Mesh(geometry, material));
      },
    );
  }

  update(delta: number) {
    this.cylinder1.rotateY(-delta * 1);
  }
}

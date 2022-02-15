import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  TextureLoader,
  AmbientLight,
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { CylinderSlot } from '@/CylinderSlot';
import slotBackground from '@/assets/slot.png';

export interface TestSceneProps extends BasicSceneProps {
}

const loader = new TextureLoader();

export class TestScene extends BasicScene {
  cylinder1: CylinderSlot;
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;
  // rotationXShiftDegrees: number;
  // cylinderRotationProgress: EaseProgress;

  constructor(props: TestSceneProps) {
    super(props);

    this.ambientLightColor = 0xFFFFFF;
    this.ambientLightIntensity = 7;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    this.cylinder1 = new CylinderSlot();
    this.scene.add(this.cylinder1.mesh);
    this.camera.position.z = 3;

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
    this.cylinder1.update(delta);
  }
}

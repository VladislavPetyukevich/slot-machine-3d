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
import numberRoll from '@/assets/number-roll.png';

export interface TestSceneProps extends BasicSceneProps {
}

const loader = new TextureLoader();

export class TestScene extends BasicScene {
  cylinder1: Mesh;
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;
  rotationXShiftDegrees: number;

  constructor(props: TestSceneProps) {
    super(props);

    this.rotationXShiftDegrees = 18;
    this.ambientLightColor = 0xFFFFFF;
    this.ambientLightIntensity = 7;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    this.cylinder1 = new Mesh(
      new CylinderGeometry(1, 1, 1, 32),
      new MeshLambertMaterial(),
    );
    this.cylinder1.rotation.x = this.getCylinderRotationToNumber(7);
    this.cylinder1.rotation.z = Math.PI / 2;
    this.scene.add(this.cylinder1);
    this.camera.position.z = 5;

    loader.load(
      numberRoll,
      (texture) => {
        (<MeshLambertMaterial>this.cylinder1.material).map = texture;
        (<MeshLambertMaterial>this.cylinder1.material).needsUpdate = true;
      },
    );

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

  getCylinderRotationToNumber(number: number) {
    const oneNumberDegrees = 360 / 10;
    return this.toRadians(
      oneNumberDegrees * number +
      this.rotationXShiftDegrees
    );
  }

  update(delta: number) {
  }

  toRadians(angle: number) {
    return angle * (Math.PI / 180);
  }
}

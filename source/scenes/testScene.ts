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
  cylinders: CylinderSlot[];
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;

  constructor(props: TestSceneProps) {
    super(props);

    this.ambientLightColor = 0xFFFFFF;
    this.ambientLightIntensity = 17;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    const cylinderScale = 1.4;
    const cylinder1 = new CylinderSlot();
    cylinder1.mesh.position.setX(-3.4);
    cylinder1.mesh.position.setY(-1.8);
    cylinder1.mesh.position.setZ(-0.8);
    const cylinder2 = new CylinderSlot();
    cylinder2.mesh.position.setX(0);
    cylinder2.mesh.position.setY(-1.8);
    cylinder2.mesh.position.setZ(-0.8);
    const cylinder3 = new CylinderSlot();
    cylinder3.mesh.position.setX(3.4);
    cylinder3.mesh.position.setY(-1.8);
    cylinder3.mesh.position.setZ(-0.8);
    this.cylinders = [cylinder1, cylinder2, cylinder3];
    this.cylinders.forEach(cylinder => {
      cylinder.mesh.scale.set(cylinderScale, cylinderScale, cylinderScale);
      this.scene.add(cylinder.mesh);
    });

    this.cylinders[0].rotateCylunderToNumber({
      number: 6,
      cycles: 7,
      durationSeconds: 1,
    });
    this.cylinders[1].rotateCylunderToNumber({
      number: 2,
      cycles: 7,
      durationSeconds: 1,
    });
    this.cylinders[2].rotateCylunderToNumber({
      number: 1,
      cycles: 7,
      durationSeconds: 1,
    });

    this.camera.position.z = 11;

    loader.load(
      slotBackground,
      (texture) => {
        const geometry = new BoxGeometry(12, 8, 0.1)
        const material = new MeshLambertMaterial({
          map: texture,
        });
        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
      },
    );
  }


  update(delta: number) {
    this.cylinders.forEach(cylinder => cylinder.update(delta));
  }
}

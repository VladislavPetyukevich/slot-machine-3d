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
    this.ambientLightIntensity = 7;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    const cylinder1 = new CylinderSlot();
    cylinder1.mesh.position.setX(-1.5);
    const cylinder2 = new CylinderSlot();
    cylinder2.mesh.position.setX(0);
    const cylinder3 = new CylinderSlot();
    cylinder3.mesh.position.setX(1.5);
    this.cylinders = [cylinder1, cylinder2, cylinder3];
    this.cylinders.forEach(cylinder => this.scene.add(cylinder.mesh));

    this.cylinders[0].rotateCylunderToNumber({
      number: 7,
      cycles: 7,
      durationSeconds: 5,
    });
    this.cylinders[1].rotateCylunderToNumber({
      number: 7,
      cycles: 7,
      durationSeconds: 10,
    });
    this.cylinders[2].rotateCylunderToNumber({
      number: 7,
      cycles: 7,
      durationSeconds: 15,
    });

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
    this.cylinders.forEach(cylinder => cylinder.update(delta));
  }
}

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

export type ValueRange = number | [number, number];

export interface CylinderSpinParams {
  cycles?: ValueRange,
  durationSeconds: ValueRange,
}

export interface TestSceneProps extends BasicSceneProps {
}

const loader = new TextureLoader();

export class TestScene extends BasicScene {
  cylinders: CylinderSlot[];
  spinConfig: [CylinderSpinParams, CylinderSpinParams, CylinderSpinParams];
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;

  constructor(props: TestSceneProps) {
    super(props);

    this.spinConfig = [
      {
        cycles: [2, 4],
        durationSeconds: [7, 10]
      },
      {
        cycles: [4, 6],
        durationSeconds: [11, 14]
      },
      {
        cycles: [7, 11],
        durationSeconds: [17, 20]
      },
    ];
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

    this.camera.position.z = 8.7;

    loader.load(
      slotBackground,
      (texture) => {
        const geometry = new BoxGeometry(12, 8, 0.1)
        const material = new MeshLambertMaterial({
          transparent: true,
          map: texture,
        });
        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
      },
    );
  }

  spin(number: number) {
    if (number < 0 || number > 999) {
      throw new Error(`Invalid spin number: '${number}'. Number must be in range from 0 to 999 (inclusive)`);
    }
    if (number % 1 !== 0) {
      throw new Error(`Invalid spin number: '${number}'. Number must be integer.`);
    }
    const spinDigits = this.divideToThreeDigits(number);
    this.spinConfig.forEach(({ cycles, durationSeconds }, index) => {
      this.cylinders[index].rotateCylunderToNumber({
        number: spinDigits[index],
        cycles: cycles ? this.getValueFromRange(cycles) : 0,
        durationSeconds: this.getValueFromRange(durationSeconds),
      });
    });
  }

  divideToThreeDigits(number: number) {
    const digits = (''+number).split('').map(Number);
    const remainingZeros = 3 - digits.length;
    for (let i = remainingZeros; i--;) {
      digits.unshift(0);
    }
    return digits;
  }

  setSpinConfig(
    params: TestScene['spinConfig']
  ) {
    this.spinConfig = params;
  }

  getValueFromRange(valueRange: ValueRange) {
    if (Array.isArray(valueRange)) {
      return this.getRandomInt(valueRange[0], valueRange[1]);
    }
    return valueRange;
  }

  update(delta: number) {
    this.cylinders.forEach(cylinder => cylinder.update(delta));
  }

  getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

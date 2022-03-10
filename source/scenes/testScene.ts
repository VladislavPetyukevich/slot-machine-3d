import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  TextureLoader,
  AmbientLight,
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { CylinderSlot } from '@/CylinderSlot';
import { CoordinatesShake } from '@/CoordinatesShake';
import { TextPainter, TextStyles } from '@/TextPainter';
import slotBackground from '@/assets/slot.png';

export type ValueRange = number | [number, number];

export interface CylinderSpinParams {
  cycles?: ValueRange,
  durationSeconds: ValueRange,
}

const enum SpinState {
  idle,
  spinning,
  spinningFinished,
}

export interface TestSceneProps extends BasicSceneProps {
  caption?: string;
  font?: string;
  fontSize?: string;
  fillStyle?: string;
  onSpinFinish?: (spinNumber: number) => void;
}

const loader = new TextureLoader();

export class TestScene extends BasicScene {
  textPainter: TextPainter;
  cylinders: CylinderSlot[];
  spinConfig: [CylinderSpinParams, CylinderSpinParams, CylinderSpinParams];
  spinState: SpinState;
  currentSpinNumber: number;
  onSpinFinish?: TestSceneProps['onSpinFinish'];
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;
  slotMesh: Mesh;
  captionMesh?: Mesh;
  isGlitchSpinSlot: boolean;
  isGlitchSpinCaption: boolean;
  isCameraShake: boolean;
  cameraShake: CoordinatesShake;

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
    this.currentSpinNumber = 0;
    this.spinState = SpinState.idle;
    this.isGlitchSpinSlot = false;
    this.isGlitchSpinCaption = false;
    this.isCameraShake = false;
    this.onSpinFinish = props.onSpinFinish;
    this.ambientLightColor = 0xFFFFFF;
    this.ambientLightIntensity = 17;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    const cylinderScaleX = 1.20;
    const cylinderScaleY = 1.11;
    const cylinderXShift = 2.48;
    const cylindersX = [-cylinderXShift, 0, cylinderXShift];
    const cylinderPositionY = -2.57;
    const cylinderPositionZ = -0.57;
    const cylinder1 = new CylinderSlot();
    const cylinder2 = new CylinderSlot();
    const cylinder3 = new CylinderSlot();
    this.cylinders = [cylinder1, cylinder2, cylinder3];
    this.cylinders.forEach((cylinder, cylinderIndex) => {
      cylinder.mesh.position.set(
        cylindersX[cylinderIndex],
        cylinderPositionY,
        cylinderPositionZ,
      );
      cylinder.mesh.scale.set(cylinderScaleY, cylinderScaleX, cylinderScaleY);
      this.scene.add(cylinder.mesh);
    });

    const aspectRatio = 1.0829875518672198;
    const geometryHeight = 8;
    const geometryWidth = geometryHeight * aspectRatio;
    const slotGeometry = new BoxGeometry(geometryWidth, geometryHeight, 0.1)
    const slotMaterial = new MeshLambertMaterial({ });
    this.slotMesh = new Mesh(slotGeometry, slotMaterial);
    this.scene.add(this.slotMesh);
    loader.load(
      slotBackground,
      (texture) => {
        const material = new MeshLambertMaterial({
          transparent: true,
          map: texture,
        });
        this.slotMesh.material = material;
      },
    );

    this.textPainter = new TextPainter({
      width: 538,
      height: 100,
    });
    if (props.caption) {
      const captionGeometry = new BoxGeometry(6.4, 0.9, 0.1)
      const captionMaterial = new MeshLambertMaterial({
        transparent: true,
      });
      this.captionMesh = new Mesh(captionGeometry, captionMaterial);
      this.scene.add(this.captionMesh);
      this.drawCaption(
        props.caption,
        {
          font: props.font,
          size: props.fontSize,
          fillStyle: props.fillStyle
        }
      );
    }
    this.resetPositions();
    this.resetRotations();
    this.cameraShake = new CoordinatesShake({
      startCoordinates: this.camera.position,
      shakesPerSecond: 35,
      amplitude: 0.7,
    });
  }


  spin(number: number) {
    if (number < 0 || number > 999) {
      throw new Error(`Invalid spin number: '${number}'. Number must be in range from 0 to 999 (inclusive)`);
    }
    if (number % 1 !== 0) {
      throw new Error(`Invalid spin number: '${number}'. Number must be integer.`);
    }
    this.currentSpinNumber = number;
    this.spinState = SpinState.spinning;
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

  checkIsSpinning() {
    return this.spinState === SpinState.spinning;
  }

  resetPositions() {
    this.camera.position.y = -0.9;
    this.camera.position.z = 10.8;
    if (this.captionMesh) {
      this.captionMesh.position.set(0, -0.7, 0.1);
    }
  }

  resetRotations() {
    this.slotMesh.rotation.set(0, 0, 0);
    if (this.captionMesh) {
      this.captionMesh.rotation.set(0, 0, 0);
    }
  }

  getValueFromRange(valueRange: ValueRange) {
    if (Array.isArray(valueRange)) {
      return this.getRandomInt(valueRange[0], valueRange[1]);
    }
    return valueRange;
  }

  drawCaption(
    caption: string,
    styles: Partial<TextStyles>,
  ) {
    this.textPainter.drawText(
      caption,
      {
        size: styles.size || '48px',
        font: styles.font || 'serif',
        fillStyle: styles.fillStyle,
      },
      dataUrl => {
        loader.load(dataUrl, texture => {
          const material = new MeshLambertMaterial({
            transparent: true,
            map: texture,
          });
          if (this.captionMesh) {
            this.captionMesh.material = material;
          }
        });
      }
    );
  }

  setGlitchSpinSlot(isEnabled: boolean) {
    this.isGlitchSpinSlot = isEnabled;
    if (!isEnabled) {
      this.resetRotations();
      this.resetPositions();
    }
  }

  setGlitchSpinCaption(isEnabled: boolean) {
    this.isGlitchSpinCaption = isEnabled;
    if (!isEnabled) {
      this.resetRotations();
      this.resetPositions();
    }
  }

  setCameraShake(isEnabled: boolean) {
    this.isCameraShake = isEnabled;
    if (!isEnabled) {
      this.resetPositions();
    }
  }

  update(delta: number) {
    this.cylinders.forEach(cylinder => cylinder.update(delta));
    if (this.isGlitchSpinSlot) {
      this.updateGlitchSpinSlot();
    }
    if (this.isGlitchSpinCaption) {
      this.updateGlitchSpinCaption();
    }
    if (this.isCameraShake) {
      this.updateCameraShake(delta);
    }
    this.updateOnFinish();
  }

  updateOnFinish() {
    if (this.spinState !== SpinState.spinning) {
      return;
    }
    const isAllFinished = this.cylinders.every(
      cylinder => cylinder.rotationProgress.checkIsProgressCompelete()
    );
    if (!isAllFinished) {
      return;
    }
    this.spinState = SpinState.spinningFinished;
    if (this.onSpinFinish) {
      this.onSpinFinish(this.currentSpinNumber);
    }
  }

  updateCameraShake(delta: number) {
    this.cameraShake.update(delta);
    this.camera.position.copy(this.cameraShake.getCurrentCoordinates());
  }

  updateGlitchSpinSlot() {
    const cylinder = this.cylinders[1];
    const cylinderRotationX =
      cylinder.mesh.rotation.x - cylinder.rotationXShiftRadians;
    this.slotMesh.rotation.y = cylinderRotationX;
  }

  updateGlitchSpinCaption() {
    if (!this.captionMesh) {
      return;
    }
    const cylinder = this.cylinders[1];
    const cylinderRotationX =
      cylinder.mesh.rotation.x - cylinder.rotationXShiftRadians;
    this.captionMesh.rotation.z = cylinderRotationX;
    this.captionMesh.rotation.y = cylinderRotationX;
    this.captionMesh.position.z = cylinderRotationX / 2;
  }

  getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

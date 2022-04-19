import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  TextureLoader,
  AmbientLight,
  SpotLight,
} from 'three';
import { BasicSceneProps, BasicScene } from '../core/Scene';
import { CylinderSlot } from '../CylinderSlot';
import { CoordinatesShake } from '../CoordinatesShake';
import { TextPainter } from '../TextPainter';

export interface TemplateValue {
  x: number;
  y: number;
  z: number;
}

export interface TemplatePosition {
  position: TemplateValue;
}

export interface TemplateScale {
  scale: TemplateValue;
}

export type TemplateCylinder = [
  TemplatePosition & TemplateScale,
  TemplatePosition & TemplateScale,
  TemplatePosition & TemplateScale,
];

export interface SceneTemplate {
  slot: TemplatePosition & TemplateScale;
  caption: TemplatePosition & TemplateScale;
  camera: TemplatePosition;
  spotlight: TemplatePosition;
  cylinders: TemplateCylinder;
}

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
  slotTextureURL: string;
  numbersRollTextureURL: string;
  caption?: string;
  font: string;
  fontSize: string;
  fillStyle?: string;
  onSpinFinish?: (spinNumber: number) => void;
  sceneTemplate?: Partial<SceneTemplate>;
}

const loader = new TextureLoader();

export class TestScene extends BasicScene {
  textPainter: TextPainter;
  cylinders: CylinderSlot[];
  spinConfig: [CylinderSpinParams, CylinderSpinParams, CylinderSpinParams];
  sceneTemplate: SceneTemplate;
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

    this.sceneTemplate = this.getSceneTemplate(props.sceneTemplate);
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

    const spotlight = new SpotLight(0xFFFFFF, 100, 30, 0.4);
    this.setMeshValueFromTemplateValue(
      spotlight.position,
      this.sceneTemplate.spotlight.position
    );
    spotlight.castShadow = true;
    this.scene.add(spotlight);

    const cylinder1 = this.createCylinder(props.numbersRollTextureURL);
    const cylinder2 = this.createCylinder(props.numbersRollTextureURL);
    const cylinder3 = this.createCylinder(props.numbersRollTextureURL);
    this.cylinders = [cylinder1, cylinder2, cylinder3];
    this.cylinders.forEach((cylinder, cylinderIndex) => {
      const cylinderTemplate = this.sceneTemplate.cylinders[cylinderIndex];
      this.setMeshValueFromTemplateValue(
        cylinder.mesh.position,
        cylinderTemplate.position
      );
      this.setMeshValueFromTemplateValue(
        cylinder.mesh.scale,
        cylinderTemplate.scale
      );
      this.scene.add(cylinder.mesh);
    });

    const slotGeometry = new BoxGeometry(1, 1, 0.1)
    this.slotMesh = new Mesh(slotGeometry, []);
    this.slotMesh.receiveShadow = true;
    this.setMeshValueFromTemplateValue(
      this.slotMesh.position,
      this.sceneTemplate.slot.position
    );
    this.setMeshValueFromTemplateValue(
      this.slotMesh.scale,
      this.sceneTemplate.slot.scale
    );
    this.scene.add(this.slotMesh);
    loader.load(
      props.slotTextureURL,
      (texture) => {
        const material = new MeshLambertMaterial({
          transparent: true,
          map: texture,
        });
        const slotMaterials: MeshLambertMaterial[] = [];
        slotMaterials[4] = material;
        slotMaterials[5] = material;
        this.slotMesh.material = slotMaterials;
      },
    );

    this.textPainter = new TextPainter({
      width: 538,
      height: 100,
      font: props.font,
      size: props.fontSize,
      fillStyle: props.fillStyle,
    });
    const captionGeometry = new BoxGeometry(1, 1, 1);
    this.captionMesh = new Mesh(captionGeometry, []);
    this.setMeshValueFromTemplateValue(
      this.captionMesh.scale,
      this.sceneTemplate.caption.scale
    );
    this.scene.add(this.captionMesh);
    if (props.caption) {
      this.setCaption(props.caption);
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

  createCylinder(texureUrl: string) {
    return new CylinderSlot({
      texture: texureUrl,
    });
  }

  setCaption(caption: string) {
    this.drawCaption(caption);
    this.resetPositions();
    this.resetRotations();
  }

  getSceneTemplate(template: TestSceneProps['sceneTemplate']) {
    const defaultSlot = {
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 8.663900414937759, y: 8, z: 1 },
    };
    const defaultCaption = {
      position: { x: 0, y: -0.7, z: 0.1 },
      scale: { x: 6.4, y: 0.9, z: 0.1 },
    };
    const defaultCamera = {
      position: { x: 0, y: -0.9, z: 10.8 },
    };
    const defaultSpotlight = {
      position: { x: 9, y: 0, z: 18 },
    };
    const defaultCylinders: TemplateCylinder = [
      {
        position: { x: -2.48, y: -2.57, z: -0.57 },
        scale: { x: 1.11, y: 1.2, z: 1.11 },
      },
      {
        position: { x: 0, y: -2.57, z: -0.57 },
        scale: { x: 1.11, y: 1.2, z: 1.11 },
      },
      {
        position: { x: 2.48, y: -2.57, z: -0.57 },
        scale: { x: 1.11, y: 1.2, z: 1.11 },
      },
    ];
    return {
      slot: template?.slot || defaultSlot,
      caption: template?.caption || defaultCaption,
      camera: template?.camera || defaultCamera,
      spotlight: template?.spotlight || defaultSpotlight,
      cylinders: template?.cylinders || defaultCylinders,
    };
  }

  resetPositions() {
    this.setMeshValueFromTemplateValue(
      this.camera.position,
      this.sceneTemplate.camera.position
    );
    if (this.captionMesh) {
      this.setMeshValueFromTemplateValue(
        this.captionMesh.position,
        this.sceneTemplate.caption.position
      );
    }
  }

  resetRotations() {
    this.slotMesh.rotation.set(0, 0, 0);
    if (this.captionMesh) {
      this.captionMesh.rotation.set(0, 0, 0);
    }
  }

  setMeshValueFromTemplateValue(
    meshValue: Mesh['scale'] | Mesh['position'],
    templateValue: TemplateValue
  ) {
    meshValue.set(
      templateValue.x,
      templateValue.y,
      templateValue.z
    );
  }

  getValueFromRange(valueRange: ValueRange) {
    if (Array.isArray(valueRange)) {
      return this.getRandomInt(valueRange[0], valueRange[1]);
    }
    return valueRange;
  }

  drawCaption(caption: string) {
    this.textPainter.drawText(
      caption,
      dataUrl => {
        loader.load(dataUrl, texture => {
          const material = new MeshLambertMaterial({
            transparent: true,
            map: texture,
          });
          const captionMaterials: MeshLambertMaterial[] = [];
          captionMaterials[4] = material;
          captionMaterials[5] = material;
          if (this.captionMesh) {
            this.captionMesh.material = captionMaterials;
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

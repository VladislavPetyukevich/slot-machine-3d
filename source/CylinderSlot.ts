import {
  Mesh,
  CylinderGeometry,
  MeshLambertMaterial,
  TextureLoader,
} from 'three';
import { EaseProgress, easeOutQuint } from '@/EaseProgress';
import numberRoll from '@/assets/number-roll.png';

const loader = new TextureLoader();

export class CylinderSlot {
  mesh: Mesh;
  rotationXShiftDegrees: number;
  rotationProgress: EaseProgress;

  constructor() {
    this.rotationXShiftDegrees = 18;
    this.mesh = new Mesh(
      new CylinderGeometry(1, 1, 1, 32),
      new MeshLambertMaterial(),
    );
    this.mesh.rotation.x = this.getCylinderRotationToNumber(0);
    this.mesh.rotation.z = Math.PI / 2;
    const rotationDurationSeconds = 10;
    this.rotationProgress = new EaseProgress({
      minValue: this.mesh.rotation.x,
      maxValue: this.getCylinderRotationToNumber(7, 3),
      progressSpeed: 1 / rotationDurationSeconds,
      transitionFunction: easeOutQuint,
    });

    loader.load(
      numberRoll,
      (texture) => {
        (<MeshLambertMaterial>this.mesh.material).map = texture;
        (<MeshLambertMaterial>this.mesh.material).needsUpdate = true;
      },
    );
  }

  getCylinderRotationToNumber(number: number, cycles = 0) {
    const oneNumberDegrees = 360 / 10;
    const ratationCyclesDegrees = 360 * cycles;
    return this.toRadians(
      oneNumberDegrees * number +
      this.rotationXShiftDegrees +
      ratationCyclesDegrees
    );
  }

  update(delta: number) {
    if (this.rotationProgress.checkIsProgressCompelete()) {
      return;
    }
    this.rotationProgress.updateProgress(delta);
    this.mesh.rotation.x = this.rotationProgress.getCurrentProgress();
  }

  toRadians(angle: number) {
    return angle * (Math.PI / 180);
  }
}

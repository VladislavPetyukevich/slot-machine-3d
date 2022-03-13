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
  rotationXShiftRadians: number;
  rotationProgress: EaseProgress;

  constructor(props: { texture?: string }) {
    this.rotationXShiftRadians = this.toRadians(18);
    const mainMaterial = new MeshLambertMaterial();
    const secondaryMaterial = new MeshLambertMaterial({ color: 0x000000 });
    const materials: MeshLambertMaterial[] = [];
    materials[0] = mainMaterial;
    materials[1] = secondaryMaterial;
    materials[2] = secondaryMaterial;
    this.mesh = new Mesh(
      new CylinderGeometry(1, 1, 1, 32),
      materials,
    );
    this.mesh.rotation.x = this.getCylinderRotationToNumber(0);
    this.mesh.rotation.z = Math.PI / 2;
    this.rotationProgress = new EaseProgress({
      transitionFunction: easeOutQuint,
    });

    loader.load(
      props.texture || numberRoll,
      (texture) => {
        (<MeshLambertMaterial>mainMaterial).map = texture;
        (<MeshLambertMaterial>mainMaterial).needsUpdate = true;
      },
    );
  }

  rotateCylunderToNumber(params: {
    number: number;
    cycles?: number;
    durationSeconds: number;
  }) {
    const rotationAngle =
      this.getCylinderRotationToNumber(params.number, params.cycles);

    this.rotationProgress.start({
      minValue: this.mesh.rotation.x,
      maxValue: rotationAngle,
      durationSeconds: params.durationSeconds,
    });
  }

  getCylinderRotationToNumber(number: number, cycles = 0) {
    const currentCycles = ~~(this.mesh.rotation.x / this.toRadians(360));
    this.mesh.rotation.x -= this.toRadians(360) * currentCycles;
    const oneNumberDegrees = 360 / 10;
    const ratationCyclesDegrees = 360 * cycles;
    return this.toRadians(
      oneNumberDegrees * number +
      ratationCyclesDegrees
    ) + this.rotationXShiftRadians;
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

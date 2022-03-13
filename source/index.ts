import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap,
} from 'three';
import { ShaderPass } from './Postprocessing/ShaderPass';
import { RenderPass } from './Postprocessing/RenderPass';
import { EffectComposer } from './Postprocessing/EffectComposer';
import { ColorCorrectionShader } from './Postprocessing/Shaders/ColorCorrectionShader';
import { TestScene, CylinderSpinParams } from '@/scenes/testScene';

export default class ThreeShooter {
  gameProps: any;
  spinQueue: number[];
  currScene: TestScene;
  // mouseSensitivity: number;
  // imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  // loaded: boolean;
  pixelRatio: number;
  renderer: WebGLRenderer;
  composer: EffectComposer;
  effectColorCorrection?: ShaderPass;

  constructor(props: any) {
    this.gameProps = props;
    this.spinQueue = [];
    this.currScene = new TestScene({
      ...props,
      onSpinFinish: this.onSpinFinish,
    });
    this.pixelRatio = 1;
    this.enabled = true;
    this.prevTime = performance.now();
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
    });
    if (typeof this.gameProps.backgroundHexColor === 'number') {
      this.renderer.setClearColor(this.gameProps.backgroundHexColor);
    }
    this.renderer.setSize(props.renderWidth, props.renderHeight);
    this.renderer.setPixelRatio(this.pixelRatio);
    // this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.toneMapping = ReinhardToneMapping;
    this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.currScene.scene, this.currScene.camera));
    this.effectColorCorrection = new ShaderPass(ColorCorrectionShader);
    this.composer.addPass(this.effectColorCorrection);

    props.renderContainer.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.currScene.camera.aspect = window.innerWidth / window.innerHeight;
      this.currScene.camera.updateProjectionMatrix();
      this.renderer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
      this.composer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
    });

    this.update();
  }

  spin(number: number) {
    if (this.currScene.checkIsSpinning()) {
      this.spinQueue.push(number);
      return;
    }
    this.currScene.spin(number);
    if (this.gameProps.onSpinStart) {
      this.gameProps.onSpinStart(number);
    }
  }

  setSpinConfig(
    config: [CylinderSpinParams, CylinderSpinParams, CylinderSpinParams]
  ) {
    this.currScene.setSpinConfig(config);
  }

  enableGlitchSpinSlot() {
    this.currScene.setGlitchSpinSlot(true);
  }

  disableGlitchSpinSlot() {
    this.currScene.setGlitchSpinSlot(false);
  }

  enableGlitchSpinCaption() {
    this.currScene.setGlitchSpinCaption(true);
  }

  disableGlitchSpinCaption() {
    this.currScene.setGlitchSpinCaption(false);
  }

  enableCameraShake() {
    this.currScene.setCameraShake(true);
  }

  disableCameraShake() {
    this.currScene.setCameraShake(false);
  }

  setCameraShakeAmplitude(amplitude: number) {
    this.currScene.cameraShake.amplitude = amplitude;
  }

  setCameraShakesPerSecond(shakesPerSecond: number) {
    this.currScene.cameraShake.updateShakesPerSecond(shakesPerSecond);
  }

  setCaption(caption: string) {
    this.currScene.setCaption(caption);
  }

  onSpinFinish = (spinNumber: number) => {
    if (this.gameProps.onSpinFinish) {
      this.gameProps.onSpinFinish(spinNumber);
    }
    if (this.spinQueue.length !== 0) {
      this.spinFromQueue();
    }
  };

  spinFromQueue() {
    const queueFirstItem = this.spinQueue.shift();
    if (typeof queueFirstItem === 'number') {
      this.spin(queueFirstItem);
    }
  }

  update = () => {
    // if (this.enabled) {
    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;
    // this.renderer.clear();
    this.currScene.update(delta);
    this.composer.render(delta);
    // this.renderer.clearDepth();
    // this.renderer.render(this.currScene.scene, this.currScene.camera);
    // this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
    // this.renderer.render(hud.scene, hud.camera);
    // hud.update(delta);
    this.prevTime = time;
    // }
    requestAnimationFrame(this.update);
  }
}

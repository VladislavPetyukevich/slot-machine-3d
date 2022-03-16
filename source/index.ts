import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap,
} from 'three';
import { ShaderPass } from './Postprocessing/ShaderPass';
import { RenderPass } from './Postprocessing/RenderPass';
import { EffectComposer } from './Postprocessing/EffectComposer';
import { ColorCorrectionShader } from './Postprocessing/Shaders/ColorCorrectionShader';
import { TestScene, CylinderSpinParams } from './scenes/testScene';

const defaultProps = {
  font: 'serif',
  fontSize: '40px',
  fillStyle: '#020000',
};

export interface SlotMachine3DProps {
  renderContainer: HTMLElement,
  numbersRollTextureURL: string,
  slotTextureURL: string,
  backgroundHexColor?: number,
  caption?: string,
  font?: string,
  fontSize?: string,
  fillStyle?: string,
  onSpinStart?: (spinNumber: number) => void,
  onSpinFinish?: (spinNumber: number) => void,
}

export default class SlotMachine3D {
  props: SlotMachine3DProps;
  spinQueue: number[];
  currScene: TestScene;
  prevTime: number;
  enabled: boolean;
  pixelRatio: number;
  renderer: WebGLRenderer;
  composer: EffectComposer;
  effectColorCorrection?: ShaderPass;

  constructor(props: SlotMachine3D['props']) {
    this.props = props;
    this.spinQueue = [];
    this.currScene = new TestScene({
      ...props,
      font: props.font || defaultProps.font,
      fontSize: props.fontSize || defaultProps.fontSize,
      fillStyle: props.fillStyle || defaultProps.fillStyle,
      renderWidth: this.props.renderContainer.offsetWidth,
      renderHeight: this.props.renderContainer.offsetHeight,
      onSpinFinish: this.onSpinFinish,
    });
    this.pixelRatio = 1;
    this.enabled = true;
    this.prevTime = performance.now();
    const customCanvas = document.createElement('canvas');
    customCanvas.style.display = 'block';
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
      canvas: customCanvas,
    });
    if (typeof this.props.backgroundHexColor === 'number') {
      this.renderer.setClearColor(this.props.backgroundHexColor);
    }
    this.renderer.setPixelRatio(this.pixelRatio);
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

    this.updateRenderSize();
    window.addEventListener('resize', () => {
      this.updateRenderSize();
    });

    this.update();
  }

  spin(number: number) {
    if (this.currScene.checkIsSpinning()) {
      this.spinQueue.push(number);
      return;
    }
    this.currScene.spin(number);
    if (this.props.onSpinStart) {
      this.props.onSpinStart(number);
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
    if (this.props.onSpinFinish) {
      this.props.onSpinFinish(spinNumber);
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

  updateRenderSize() {
    this.currScene.camera.aspect = window.innerWidth / window.innerHeight;
    this.currScene.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.props.renderContainer.offsetWidth,
      this.props.renderContainer.offsetHeight
    );
    this.composer.setSize(
      this.props.renderContainer.offsetWidth,
      this.props.renderContainer.offsetHeight
    );
  }

  update = () => {
    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;
    this.currScene.update(delta);
    this.composer.render(delta);
    this.prevTime = time;
    requestAnimationFrame(this.update);
  }
}

export { SlotMachine3D };

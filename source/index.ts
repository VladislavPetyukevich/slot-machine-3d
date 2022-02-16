import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap,
  Scene,
} from 'three';
import { BasicScene } from '@/core/Scene';
import { TestScene } from '@/scenes/testScene';

export default class ThreeShooter {
  gameProps: any;
  currScene: BasicScene;
  loadedScene?: BasicScene;
  // mouseSensitivity: number;
  // imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  // loaded: boolean;
  pixelRatio: number;
  renderer: WebGLRenderer;
  // composer: EffectComposer;
  // effectColorCorrection?: ShaderPass;

  constructor(props: any) {
    this.gameProps = props;
    this.currScene = new TestScene(props);
    this.pixelRatio = 1;
    this.enabled = true;
    this.prevTime = performance.now();
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
    });
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

    props.renderContainer.appendChild(this.renderer.domElement);

    this.update();
  }

  update = () => {
    // if (this.enabled) {
    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;
    // this.renderer.clear();
    this.currScene.update(delta);
    // this.composer.render(delta);
    // this.renderer.clearDepth();
    this.renderer.render(this.currScene.scene, this.currScene.camera);
    // this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
    // this.renderer.render(hud.scene, hud.camera);
    // hud.update(delta);
    this.prevTime = time;
    // }
    requestAnimationFrame(this.update);
  }
}

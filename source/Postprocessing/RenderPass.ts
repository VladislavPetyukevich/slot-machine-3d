/**
 * @author alteredq / http://alteredqualia.com/
 */


import { Camera, Color, Material, Scene, WebGLRenderer } from "three";
import { Pass } from "./Pass";


export class RenderPass extends Pass {
  scene: Scene;
  camera: Camera;
  overrideMaterial: Material | null;
  clearColor: Color | null;
  clearAlpha: number;
  clearDepth: boolean;

	constructor(scene: Scene, camera: Camera, overrideMaterial?: Material, clearColor?: Color, clearAlpha?: number) {
		super();

		this.scene = scene;
		this.camera = camera;
	
		this.overrideMaterial = overrideMaterial || null;
	
		this.clearColor = clearColor || null;
		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;
	
		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;
	}

	render( renderer: WebGLRenderer, writeBuffer: any, readBuffer: any /*, deltaTime, maskActive */ ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.scene.overrideMaterial = this.overrideMaterial;

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.clearDepth();

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
		if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
		renderer.render( this.scene, this.camera );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor as any, oldClearAlpha );

		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;

	}
}

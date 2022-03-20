/**
 * @author alteredq / http://alteredqualia.com/
 */


import { Camera, Scene, WebGLRenderer } from "three";
import { Pass } from "./Pass";


export class MaskPass extends Pass {
	scene: Scene;
  camera: Camera;
  inverse: boolean;

	constructor(scene: Scene, camera: Camera) {
		super();
		this.scene = scene;
		this.camera = camera;
	
		this.clear = true;
		this.needsSwap = false;
	
		this.inverse = false;
	}

	render( renderer: WebGLRenderer, writeBuffer: any, readBuffer: any /*, deltaTime, maskActive */ ) {

		var context = renderer.getContext();
		var state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );

		// draw into the stencil buffer

		renderer.setRenderTarget( readBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );

	}
}

export class ClearMaskPass extends Pass {
	needsSwap: boolean;

	constructor() {
		super();
		this.needsSwap = false;
	}

	render( renderer: WebGLRenderer /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		renderer.state.buffers.stencil.setTest( false );

	}
}


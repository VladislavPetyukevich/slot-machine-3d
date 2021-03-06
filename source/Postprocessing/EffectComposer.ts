/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	Clock,
	LinearFilter,
	Mesh,
	OrthographicCamera,
	PlaneBufferGeometry,
	RGBAFormat,
	Vector2,
  WebGLRenderer,
	WebGLRenderTarget,
} from "three";
import { CopyShader } from "./Shaders/CopyShader";
import { ShaderPass } from "./ShaderPass";
import { MaskPass, ClearMaskPass } from "./MaskPass";
import { Pass } from "./Pass";

export class EffectComposer {
  renderer: WebGLRenderer;
  renderTarget1: WebGLRenderTarget;
  renderTarget2: WebGLRenderTarget;
  writeBuffer: WebGLRenderTarget;
  readBuffer: WebGLRenderTarget;
  passes: Pass[];
  copyPass: ShaderPass;
  clock: Clock;
  renderToScreen: boolean;
  _pixelRatio: number;
  _width: number;
  _height: number;

  constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getSize( new Vector2() );
		this._pixelRatio = renderer.getPixelRatio();
		this._width = size.width;
		this._height = size.height;

		renderTarget = new WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, parameters );
		renderTarget.texture.name = 'EffectComposer.rt1';

	} else {

		this._pixelRatio = 1;
		this._width = renderTarget.width;
		this._height = renderTarget.height;

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.renderToScreen = true;

	this.passes = [];

	// dependencies

	if ( CopyShader === undefined ) {

		console.error( 'THREE.EffectComposer relies on CopyShader' );

	}

	if ( ShaderPass === undefined ) {

		console.error( 'THREE.EffectComposer relies on ShaderPass' );

	}

	this.copyPass = new ShaderPass( CopyShader );

	this.clock = new Clock();
  }

	swapBuffers() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

	addPass( pass: Pass ) {

		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize( new Vector2() );
		pass.setSize( size.width, size.height );

	}

	insertPass( pass: Pass, index: number ) {

		this.passes.splice( index, 0, pass );

	}

	isLastEnabledPass( passIndex: number ) {

		for ( var i = passIndex + 1; i < this.passes.length; i ++ ) {

			if ( this.passes[ i ].enabled ) {

				return false;

			}

		}

		return true;

	}

	render( deltaTime?: number ) {

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = this.clock.getDelta();

		}

		var currentRenderTarget = this.renderer.getRenderTarget();

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.getContext();

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff ); // avoid direct gl calls

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, /* deltaTime */ );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff ); // avoid direct gl calls

				}

				this.swapBuffers();

			}

			if ( MaskPass !== undefined ) {

				if ( pass instanceof MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

		this.renderer.setRenderTarget( currentRenderTarget );

	}

	reset( renderTarget?: WebGLRenderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getSize( new Vector2() );
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	}

	setSize( width: number, height: number ) {

		this._width = width;
		this._height = height;

		var effectiveWidth = this._width * this._pixelRatio;
		var effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

		}

	}

	setPixelRatio( pixelRatio: number ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

};

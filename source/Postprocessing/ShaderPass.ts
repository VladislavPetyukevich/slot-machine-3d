/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	Material,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderer
} from "three";
import { FullScreenQuad, Pass } from "./Pass";

export class ShaderPass extends Pass {
	textureID: string;
  uniforms: object;
  material: Material;
  fsQuad: FullScreenQuad;

	constructor(shader: object, textureID?: string) {
		super();
		this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

		this.uniforms = {};
		this.material = {} as Material;

	if ( shader instanceof ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if ( shader ) {

		this.uniforms = (shader as any).uniforms;

		this.material = new ShaderMaterial( {

			defines: Object.assign( {}, (shader as any).defines ),
			uniforms: this.uniforms,
			vertexShader: (shader as any).vertexShader,
			fragmentShader: (shader as any).fragmentShader

		} );

	}

	this.fsQuad = new FullScreenQuad( this.material );
	}

		render( renderer: WebGLRenderer, writeBuffer: any, readBuffer: any /*, deltaTime, maskActive */ ) {

		if ( (this.uniforms as any)[ this.textureID ] ) {

			(this.uniforms as any)[ this.textureID ].value = readBuffer.texture;

		}

		this.fsQuad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			this.fsQuad.render( renderer );

		}

	}

};

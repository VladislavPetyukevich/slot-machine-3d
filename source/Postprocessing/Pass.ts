import {
	OrthographicCamera,
	PlaneBufferGeometry,
	Mesh,
  Material,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

export class Pass {
  enabled: boolean;
  needsSwap: boolean;
  clear: boolean;
  renderToScreen: boolean;

  constructor() {
	  // if set to true, the pass is processed by the composer
	  this.enabled = true;

	  // if set to true, the pass indicates to swap read and write buffer after rendering
	  this.needsSwap = true;

	  // if set to true, the pass clears its buffer before rendering
	  this.clear = false;

	  // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
	  this.renderToScreen = false;
  }

  setSize(width: number, height: number) {}

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean) {
    console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );
  }
}

// Object.assign( Pass.prototype, {
// 
// 	setSize: function ( /* width, height */ ) {},
// 
// 	render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {
// 
// 		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );
// 
// 	}
// 
// } );

// Helper for passes that need to fill the viewport with a single quad.

var camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
var geometry = new PlaneBufferGeometry( 2, 2 );

export class FullScreenQuad {
    _mesh: Mesh;

  constructor(material?: Material) {
		this._mesh = new Mesh( geometry, material );
  }

  get material() {
    return this._mesh.material as Material;
  }

  set material(value: Material) {
    this._mesh.material = value;
  }

	render( renderer: WebGLRenderer ) {
			renderer.render( this._mesh as any, camera );
  }
}


import vs from './shaders/terrain.vert';
import fs from './shaders/terrain.frag';

const oUniforms={
	maxHeight:230.0,
	fogDensity:.01
}

class Terrain{
	constructor(){
		this._init()
		gui.add(oUniforms, 'maxHeight', 0, 500);

		const fFog = gui.addFolder('Fog');
		fFog.add(oUniforms, 'fogDensity', 0, 0.1).step(0.01);
		fFog.open();
	}
	_init(){
		var textureHeight = new THREE.TextureLoader().load( 'img/height.jpg' );
		var textureNormal = new THREE.TextureLoader().load( 'img/normal.jpg' );

		var textureEnv = new THREE.CanvasTexture(getAssets('bg'))
		textureEnv.wrapS = textureEnv.wrapT = THREE.RepeatWrapping;

		var customUniforms = {
			textureHeight:	{ type: "t", value: textureHeight },
			maxHeight:	    { type: "f", value: oUniforms.maxHeight },
			roughness: { type: "f",value:1},
			specular:{ type: "f",value:.25},
			metallic:{ type: "f",value:0},
			baseColor:{ type: "v3",value:new THREE.Vector3(.25,.25,.25)},
			textureNormal:	{ type: "t", value: textureNormal },
			textureEnv:	{ type: "t", value: textureEnv },
			"uFogDensity": {type:'f',value:oUniforms.fogDensity},
			"uFogColor": {type:'v3',value:new THREE.Vector3(1, 1, 1)}
		};

		var customMaterial = new THREE.ShaderMaterial(
			{
				uniforms: customUniforms,
				vertexShader:   vs,
				fragmentShader: fs,
				side: THREE.DoubleSide
			});

		var planeGeo = new THREE.PlaneBufferGeometry( 8000, 8000, 200, 200 );
		this.plane = new THREE.Mesh(planeGeo, customMaterial );
		this.plane.rotation.x = -Math.PI / 2;
		this.plane.position.y = -300;
	}

	update(){
		this.plane.material.uniforms.maxHeight.value = oUniforms.maxHeight;
		this.plane.material.uniforms.uFogDensity.value = oUniforms.fogDensity;
	}
}
module.exports=Terrain
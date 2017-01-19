import Scene from './scene';
import Terrain from './SceneTerrain';
import Water from './SceneWater';
import getSky from './SceneSky';

class mainScene extends Scene{
	constructor(dom){
		super(dom);//call _init,_addLight
		this.water = new Water();
		this.terrain = new Terrain();
		this.update=this._update.bind(this)
		this._resize=this._resize.bind(this)
		this.init();
	}

	init(){
		this.camera.position.set(-6.7,.5,-14.4);
		this.add(this.terrain.plane)
		this.add(this.water.plane)
		var sky=getSky();
		this.add(sky)

	}

	load(callback){
		callback()
	}
	play(){
		this.update()
		this.addListeners()
	}
	_resize(){
		Scene.prototype.resize.call(this,window.innerWidth,window.innerHeight)
	}
	_update(){
		requestAnimationFrame(this.update)

		this.render()
		this.water.update()
		this.terrain.update()
	}
	addListeners(){
		window.addEventListener('resize',this._resize)
	}
	
}
export default mainScene;
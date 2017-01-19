import dat from 'dat-gui';
import mainScene from  './mainScene';
import AssetsLoader from'assets-loader';

window.gui = new dat.GUI({ width:300 });
const container = document.querySelector('.container');
const progressbar = container.querySelector('.progress-bar');
const assets =[{
	id: 'bg',
	url: 'img/bg-2.jpg'
}];
window.getAssets = function(id) {	return window.assets.find( (a) => a.id === id).file;	}

let loader = AssetsLoader({ log: true })
	.add(assets)
	.on('error', function(error) {
		console.error(error)
	})
	.on('progress', (progress) => {
		progressbar.innerHTML = 'Loading...'+(progress * 100).toFixed() + '%';
	})
	.on('complete', _loadScene)
	.start();

function _loadScene(assets){
	window.assets=assets;
	setTimeout(()=>{
		progressbar.style.display='none'
		container.querySelector('canvas').style.opacity=1;
	},200)
	const t=new mainScene(container);
	t.load(() => t.play());
}

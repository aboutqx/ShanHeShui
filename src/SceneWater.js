var planeGeo = new THREE.PlaneBufferGeometry( 5000, 5000, 100, 100 );
var material = new THREE.MeshBasicMaterial({
	color:'lightblue',
	opacity: 0.75,
    transparent: true
})
var plane = new THREE.Mesh(	planeGeo, material );

var data={
	height:-246
}
plane.rotation.x = -Math.PI / 2;
plane.position.y = data.height;


var Water=function(){
	this.plane=plane;
	gui.add(data, 'height', -300,100);
}
Water.prototype={
	update:function(){
		plane.position.y = data.height;
	}
}
module.exports=Water;
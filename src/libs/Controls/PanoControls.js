var THREE,container;
THREE.PanoControls=function(pano,domElement,radius){
  var camera=pano.camera,renderer=pano.renderer;

  this.domElement = ( domElement !== undefined ) ? domElement : document;

  var isUserInteracting = false,ellapsedTime, ellapsedFactor,
    onPointerDownPointerX = 0, onPointerDownPointerY = 0,
    lon = -90, onPointerDownLon = 0,
    lat = 0, onPointerDownLat = 0,
    phi = 0, theta = 0, oDist = 0, oFov,
    fov=camera.fov||70,nFov=camera.fov||70,nLat = 0, nLon =-90,time=new Date().getTime()
    ;

  camera.target=camera.target||new THREE.Vector3(0,0,0);

  this.update=function(){

    var cd = new Date();
    var ctime = cd.getTime();

    ellapsedTime = ( ctime - time );
    ellapsedFactor = ellapsedTime / 16;

    var s = .15 * ellapsedFactor;
    lon += ( nLon - lon ) * s;
    lat += ( nLat - lat ) * s;
    fov += ( nFov - fov ) * s;

    camera.fov = fov;

    camera.updateProjectionMatrix();

    lat = Math.max( - 85, Math.min( 85, lat ) );
    phi = THREE.Math.degToRad( 90 - lat );
    theta = THREE.Math.degToRad( lon );

    camera.target.x = radius * Math.sin( phi ) * Math.cos( theta );
    camera.target.y = radius * Math.cos( phi );
    camera.target.z = radius * Math.sin( phi ) * Math.sin( theta );

    camera.lookAt( camera.target );
    time = ctime;
    
    pano.nLon=nLon;
  };
  function onWindowResized() {
    /*
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    */
  }

  function onDocumentMouseDown( event ) {

    event.preventDefault();

    isUserInteracting = true;

    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

  }

  function onDocumentMouseMove( event ) {

    event.preventDefault();
    var f=fov/500;

    if( navigator.pointer && navigator.pointer.isLocked ) {
      nLon = event.webkitMovementX * f;
      nLat += event.webkitMovementY * f;
    } else if ( document.mozPointerLockElement == container ){
      if( Math.abs( event.mozMovementX ) < 100 || Math.abs( event.mozMovementY ) < 100 ) {
        nLon = event.mozMovementX * f;
        nLat -= event.mozMovementY * f;
      }
    } else {
      if ( isUserInteracting ) {
        var dx = ( onPointerDownPointerX - event.clientX ) * f;
        var dy = ( event.clientY - onPointerDownPointerY ) * f;
        nLon = dx + onPointerDownLon; // reversed dragging direction (thanks @mrdoob!)
        nLat = dy + onPointerDownLat;


      }
    }


  }

  function onDocumentMouseUp( event ) {
    event.preventDefault();

    isUserInteracting = false;

  }
  function onTouchStart( event ) {

    isUserInteracting = true;


    if( event.touches.length == 2 ) {

      var t = event.touches;
      oDist = Math.sqrt(
          Math.pow( t[ 0 ].clientX - t[ 1 ].clientX, 2 ) +
          Math.pow( t[ 0 ].clientY - t[ 1 ].clientY, 2 ) );
      oFov = nFov;

      isUserInteracting = true;

    } else {

      var t = event.touches[ 0 ];

      onPointerDownPointerX = t.clientX;
      onPointerDownPointerY = t.clientY;

      onPointerDownLon = lon;
      onPointerDownLat = lat;

    }

    event.preventDefault();

  }

  function onTouchMove( event ) {

    if( event.touches.length == 2 ) {

      var t = event.touches;
      var dist = Math.sqrt(
          Math.pow( t[ 0 ].clientX - t[ 1 ].clientX, 2 ) +
          Math.pow( t[ 0 ].clientY - t[ 1 ].clientY, 2 ) );

      nFov = oFov + .1 * ( oDist - dist );

    } else {

      var t = event.touches[ 0 ];
      nLon = - .1 * ( t.clientX - onPointerDownPointerX ) + onPointerDownLon;
      nLat = .1 * ( t.clientY - onPointerDownPointerY ) + onPointerDownLat;

    }

    event.preventDefault();

  }

  function onTouchEnd( event ) {

    event.preventDefault();
    isUserInteracting = false;

  }

  function onDocumentMouseWheel( event ) {
    event = event ? event : window.event;
    nFov = fov - ( event.detail ? event.detail * -5 : event.wheelDelta / 8 );
    nFov=nFov<30?30:nFov;
    nFov=nFov>90?90:nFov;

  }
  this.control={
    zoomIn:function(){
      nFov-=10;
      nFov=nFov<30?30:nFov;
      nFov=nFov>90?90:nFov;
    },
    zoomOut:function(){
      nFov+=10;
      nFov=nFov<30?30:nFov;
      nFov=nFov>90?90:nFov;
    },
    rotateRight:function(){
      nLon+=10;
    },
    rotateLeft:function(){
      nLon-=10;
    },
    rotateTop:function(){
      nLat+=10;
    },
    rotateDown:function(){
      nLat-=10;
    }
  };

  //document.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
  this.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  this.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  this.domElement.addEventListener( 'mouseover', onDocumentMouseUp, false );
  this.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
  this.domElement.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
  this.domElement.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

  window.addEventListener( 'resize', onWindowResized, false );

  this.domElement.addEventListener( 'touchstart', onTouchStart, false );
  this.domElement.addEventListener( 'touchmove', onTouchMove, false );
  this.domElement.addEventListener( 'touchend', onTouchEnd, false );
  this.domElement.addEventListener( 'touchcancel', onTouchEnd, false );
};

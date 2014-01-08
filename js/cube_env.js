window.onload = function() {
	var container = document.getElementById('container');

	var stats;

    var camera, scene, renderer;
    var geometry, material, mesh;
    var target = new THREE.Vector3();
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;

    var fov = 70,
    texture_placeholder,
    isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;

    var touchX, touchY;


    var yaw, roll, pitch;
    var hlookat = 0;
    var vlookat = 0;
    var hasGyro = false;


    init();
    initStats();
    animate();

    function initStats() 
    {
        stats = new Stats();
        stats.setMode(1);

        // Align top left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.body.appendChild( stats.domElement );

    }

    function init() 
    {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, containerWidth / containerHeight, 1, 1000 );

        // create cube environment

        var sides = [
        {
            url: 'textures/cube/church/posx.jpg',
            position: [ -512, 0, 0 ],
            rotation: [ 0, Math.PI / 2, 0 ]
        },
        {
            url: 'textures/cube/church/negx.jpg',
            position: [ 512, 0, 0 ],
            rotation: [ 0, -Math.PI / 2, 0 ]
        },
        {
            url: 'textures/cube/church/posy.jpg',
            position: [ 0,  512, 0 ],
            rotation: [ Math.PI / 2, 0, Math.PI ]
        },
        {
            url: 'textures/cube/church/negy.jpg',
            position: [ 0, -512, 0 ],
            rotation: [ - Math.PI / 2, 0, Math.PI ]
        },
        {
            url: 'textures/cube/church/posz.jpg',
            position: [ 0, 0,  512 ],
            rotation: [ 0, Math.PI, 0 ]
        },
        {
            url: 'textures/cube/church/negz.jpg',
            position: [ 0, 0, -512 ],
            rotation: [ 0, 0, 0 ]
        }
        ];

        for ( var i = 0; i < sides.length; i ++ ) 
        {

            var side = sides[ i ];

            var element = document.createElement( 'img' );
            element.width = 1026; // 2 pixels extra to close the gap.
            element.src = side.url;

            var object = new THREE.CSS3DObject( element );
            object.position.fromArray( side.position );
            object.rotation.fromArray( side.rotation );
            scene.add( object );

        }

        // create particles

        // create the particle variables
        var particleCount = 100;
        

        // now create the individual particles
        for( var p = 0; p < particleCount; p++ )
        {

            var element = document.createElement( 'div' );
            element.className = 'element';
            //element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

            // create a particle with random
            // position values, -250 -> 250

            var object = new THREE.CSS3DObject( element );
            object.position.x = Math.random() * 500 - 250;
            object.position.y = Math.random() * 500 - 250;
            object.position.z = Math.random() * 500 - 250;

            object.lookAt( camera.position );
            
            // add it to the scene
            scene.add( object );
        }

        

        // test for compass or mouse nav

        if (window.DeviceOrientationEvent) {
            console.log("startGyroNav");
            window.addEventListener('deviceorientation', compassTest);
            hasGyro = true;
        } else {
            console.log("startMouseNav");
            startMouseNav();
        }

		// Set up renderer, scene and camera
		renderer = new THREE.CSS3DRenderer();
		renderer.setSize( containerWidth, containerHeight );
		container.appendChild( renderer.domElement );
    }


    function compassTest(event)
    {
        window.removeEventListener('deviceorientation', compassTest);
        if (event.webkitCompassHeading != undefined || event.alpha != null) // Device does have a compass
        {
            hasCompass = true;
        }
        else
        {
            hasCompass = false;
        }
        startGyro();
        console.log("startGyro");
    }

    // -------------------------------------------------------
    // --------------   Mouse Navigation ---------------------

    function startMouseNav() {

        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
        document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);
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

        if ( isUserInteracting ) {

            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

        }

    }

    function onDocumentMouseUp( event ) {

        isUserInteracting = false;

    }

    function onDocumentMouseWheel( event ) {

        // WebKit

        if ( event.wheelDeltaY ) {

            fov -= event.wheelDeltaY * 0.05;

                // Opera / Explorer 9

            } else if ( event.wheelDelta ) {

                fov -= event.wheelDelta * 0.05;

                // Firefox

            } else if ( event.detail ) {

                fov += event.detail * 1.0;

            }

            camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
            render();

        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

            containerWidth = window.innerWidth;
            containerHeight = window.innerHeight;
        }

    // --------------   End Mouse Navigation -----------------
    // -------------------------------------------------------
    

    
    function startGyro() {
        window.addEventListener('deviceorientation', onDeviceOrientationChange); // Gyroscope
    }
    
    function onDeviceOrientationChange(event)
    {

        yaw = event.alpha;
        pitch = event.beta;
        roll = event.gamma;

        /*
        console.log("hlookat = " + THREE.Math.degToRad( hlookat ));
        console.log("vlookat = " + THREE.Math.degToRad( vlookat ));
        */

        hlookat = (-yaw -180 ) % 360;
        vlookat = Math.max(Math.min(( pitch),90),-90);
        
        // fix gimbal lock
        if( Math.abs(pitch) > 70 ) {
            altyaw = event.alpha; 
            document.getElementById("doEvent").innerHTML = "gimbal lock";

            switch(window.orientation) {
                case 0:
                if ( pitch>0 ) 
                    altyaw += 180;
                break;
                case 90: 
                altyaw += 90;
                break;
                case -90: 
                altyaw += -90;
                break;
                case 180:
                if ( pitch<0 ) 
                    altyaw += 180;
                break;
            }

            altyaw = altyaw % 360;
            if( Math.abs( altyaw - yaw ) > 180 ) 
                altyaw += ( altyaw < yaw ) ? 360 : -360;

            factor = Math.min( 1, ( Math.abs( pitch ) - 70 ) / 10 );
            yaw = yaw * ( 1-factor ) + altyaw * factor;
        } else {
            document.getElementById("doEvent").innerHTML = "DeviceOrientation";
        }

        document.getElementById("doTiltLR").innerHTML = Math.round(roll);
        document.getElementById("doTiltFB").innerHTML = Math.round(pitch);
        document.getElementById("doDirection").innerHTML = Math.round(yaw);       
    }
    
    
    function animate() {

        requestAnimationFrame( animate );
        
        //lon +=  0.1;
        lat = Math.max( - 85, Math.min( 85, lat ) );
        //phi = THREE.Math.degToRad( 90 - lat );
        //theta = THREE.Math.degToRad( lon );

        if (hasGyro) {
            phi = THREE.Math.degToRad( 180 - roll );
            theta = THREE.Math.degToRad( 90 - yaw );
        } else {
            phi = THREE.Math.degToRad( 90 - lat );
            theta = THREE.Math.degToRad( lon );
        }
        
        

        target.x = Math.sin( phi ) * Math.cos( theta );
        target.y = Math.cos( phi );
        target.z = Math.sin( phi ) * Math.sin( theta );

        
        /*
        target.x = THREE.Math.degToRad(hlookat);
        target.y = THREE.Math.degToRad(vlookat);
        */
        
        camera.lookAt( target );
        
        renderer.render( scene, camera );

        stats.update();
        
    }
}
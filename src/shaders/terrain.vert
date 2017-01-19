uniform sampler2D textureHeight;
uniform float maxHeight;
uniform sampler2D textureNormal;

varying vec3 vPosition;
varying vec2 vUV;
varying mat4 vModelMatrix;
varying vec4 worldPosition;
void main()
{ 
	vUV = uv;
	
	float vAmount = texture2D( textureHeight, uv ).r; // assuming map is grayscale it doesn't matter if you use r, g, or b.
	
	// move the position along the normal
	vec3 newPosition = position + normal * maxHeight * vAmount;

    vec3 vNormal = normalMatrix * normal;
	vec4 viewSpacePosition	= modelViewMatrix * vec4(newPosition, 1.0);

	worldPosition = modelMatrix * vec4( newPosition, 1.0 );
	vPosition = viewSpacePosition.xyz;
	vModelMatrix = modelMatrix;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
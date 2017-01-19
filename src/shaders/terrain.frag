uniform vec3 baseColor;
uniform float roughness;
uniform float metallic;    
uniform float specular;
uniform vec2 Resolution;
uniform float uFogDensity;
uniform vec3 uFogColor; 
uniform sampler2D textureNormal;
uniform sampler2D textureEnv;


varying vec2 vUV;
varying vec3 vPosition;
varying mat4 vModelMatrix;
varying vec4 worldPosition;
#define PI 3.1415926535897932384626433832795

// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

// http://the-witness.net/news/2012/02/seamless-cube-map-filtering/
vec3 fix_cube_lookup( vec3 v, float cube_size, float lod ) {
	float M = max(max(abs(v.x), abs(v.y)), abs(v.z));
	float scale = 1.0 - exp2(lod) / cube_size;
	if (abs(v.x) != M) v.x *= scale;
	if (abs(v.y) != M) v.y *= scale;
	if (abs(v.z) != M) v.z *= scale;
	return v;
}
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
}

vec3 getPbr(vec3 N, vec3 V, vec3 baseColor, float roughness, float metallic, float specular) {
	vec3 diffuseColor	= baseColor - baseColor * metallic;
	vec3 specularColor	= mix( vec3( 0.08 * specular ), baseColor, specular );	

	vec3 color;
	float roughness4 = pow(roughness, 4.0);
	
	// sample the pre-filtered cubemap at the corresponding mipmap level
	float numMips		= 6.0;
	float mip			= numMips - 1.0 + log2(roughness);
	vec3 lookup			= -reflect( V, N );
	lookup				= fix_cube_lookup( lookup, 512.0, mip );

	vec3 worldNormal = normalize( mat3( vModelMatrix[0].xyz, vModelMatrix[1].xyz, vModelMatrix[2].xyz ) * N);
    vec3 I =  - cameraPosition  + worldPosition.xyz;
    vec3 R = normalize(reflect(I, worldNormal));

    float yaw = .5 + atan( R.z, R.x ) / ( 2.0 * PI );
    float pitch = .5 + atan( R.y, length( R.xz ) ) / ( PI );
    vec3 reflectedColor = texture2D( textureEnv, vec2( yaw, pitch ) ).rgb;

	vec3 radiance		=  reflectedColor ;//pow( textureCubeLodEXT( uRadianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	vec3 irradiance		= vec3(1.);//pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );
	
	// get the approximate reflectance
	float NoV			= saturate( dot( N, V ) );
	vec3 reflectance	= EnvBRDFApprox( specularColor, roughness4, NoV );
	
	// combine the specular IBL and the BRDF
    vec3 diffuse  		= diffuseColor * irradiance;
    vec3 _specular 		= radiance * reflectance;
	color				= diffuse + reflectance;

	return color;
}

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

void main() 
{	
	vec3 N = texture2D( textureNormal, vUV).rgb * 2.0 - 1.0;
	N = normalize(N);

	vec3 V = normalize( cameraPosition  );

	vec3 diffuse = vec3(.267,.322,.525);
	vec3 color 	= getPbr(N, V, diffuse.rgb, roughness, metallic, specular);

    float uGamma = 2.2;
    // apply the tone-mapping
    color				= Uncharted2Tonemap( color * 5. );
    // white balance
    color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );

    // gamma correction
    //color				= pow( color, vec3( 1.0 / uGamma ) );

	float fogDistance 	= length(vPosition/18.);
	float fogAmount 	= fogFactorExp2(fogDistance, uFogDensity);
	//color 				= mix(color, uFogColor, fogAmount);
    gl_FragColor = vec4(color,1.  );
}  
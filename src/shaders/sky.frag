uniform vec2 iResolution;
varying vec2 vUV;

const vec3 skycolour1 = vec3(0.2, 0.4, 0.6);
const vec3 skycolour2 = vec3(0.4, 0.7, 1.0);

void main(){
	vec2 p = vUV.xy / iResolution.xy;
	vec3 skycolour = mix(skycolour2, skycolour1, p.y);
}
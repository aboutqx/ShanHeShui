precision highp float;
varying vec2 vUv;
attribute vec2 position;
attribute vec2 uv;

void main() {

   gl_Position = vec4(position.x,position.y,0.0,1.0);
   vUv = uv;
}
precision mediump float;

uniform vec2 u_resolution;

vec3 color1 = vec3(1.000,0.000,0.133);
// vec3 color2 = vec3(1.000,0.621,0.465);
vec3 color2 = vec3(0.1, 0.621, 1.0);
vec3 color3 = vec3(1.000,0.878,0.758);

float heart(float d, float a)
{
    return 0.48 * (d * 0.6 - sin(a));
}

void main()
{
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // vec2 st = gl_FragCoord.xy / vec2(600, 600);
    st = st + vec2(0.0, -0.4);
    vec3 color = vec3(0.0);

    vec2 pos = vec2(0.5)-st;
    float d = length(abs(2.696 * pos + vec2(0.0,0.5)));

    float r = length(pos)*2.0;
    float a = atan(pos.y,pos.x);

	float f = heart(d,a);
    // float ff = heart(0.8,-a);
	// vec3 heartshape = vec3(smoothstep(ff,ff+0.02,r));
    color = mix(color1,color2,fract(f*12.0));
    // color = mix(color,color3, heartshape);

    gl_FragColor = vec4(color, 1.0);
}

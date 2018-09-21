precision mediump float;

uniform sampler2D u_color;
uniform sampler2D u_newcolor;
uniform vec2 u_mouseLoc;
uniform vec2 u_resolution;
uniform float u_r;    // desired impulse radius

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;

    // original color
    vec4 oldcolor = texture2D(u_color, fragCoord/u_resolution);
    // new color
    vec4 newcolor = texture2D(u_newcolor, fragCoord/u_resolution);

    // calculate impulse area
    vec2 x = fragCoord/u_resolution; // normalized fragment position
    vec2 xp = u_mouseLoc/u_resolution;    // normalized impulse position
    float r = u_r;
    float fac = exp(-pow(length(x - xp), 2.0) / r);

//    fac = (fac > 0.3) ? fac : 0.0;

    // add color
    vec3 color = oldcolor.xyz + newcolor.xyz * fac;
//    vec3 color = oldcolor.xyz;
    gl_FragColor = vec4(color, 1.0);
}
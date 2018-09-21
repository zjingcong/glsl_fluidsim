precision mediump float;

uniform sampler2D u_velocity;
uniform vec2 u_mouseDir;
uniform vec2 u_mouseLoc;
uniform vec2 u_resolution;
uniform vec2 u_resolution_render;
uniform float u_dt;
uniform float u_r;    // desired impulse radius

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;

    // original velocity
    vec2 v = texture2D(u_velocity, fragCoord/u_resolution).xy;

    // calculate force based on mouse motion
    vec2 F = u_mouseDir/400.0;

    // calculate impulse area
    vec2 x = fragCoord/u_resolution; // normalized fragment position
    vec2 xp = u_mouseLoc/u_resolution_render;    // normalized impulse position
    float r = u_r;
    float fac = exp(-pow(length(x - xp), 2.0) / r);

    // fac = (fac > 0.3) ? fac : 0.0;

    // add velocity
    vec2 c = F * u_dt * fac;
    vec2 velocity = v + c;

    gl_FragColor = vec4(velocity, 0.0, 1.0);
}

precision mediump float;

uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform vec2 u_dxdy;

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    float x1 = texture2D(u_velocity, (fragCoord + vec2(1.0, 0.0))/u_resolution).x;
    float x0 = texture2D(u_velocity, (fragCoord + vec2(-1.0, 0.0))/u_resolution).x;
    float divx = (x1 - x0) / (2.0 * u_dxdy.x);

    float y1 = texture2D(u_velocity, (fragCoord + vec2(0.0, 1.0))/u_resolution).y;
    float y0 = texture2D(u_velocity, (fragCoord + vec2(0.0, -1.0))/u_resolution).y;
    float divy = (y1 - y0) / (2.0 * u_dxdy.y);

    float div = divx + divy;
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}

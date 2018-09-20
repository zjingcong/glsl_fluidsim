precision mediump float;

uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform vec2 u_dxdy;

vec2 boundary(vec2 pos)
{
    vec2 new_pos;
    new_pos.x = abs(pos.x);
    new_pos.y = abs(pos.y);
    new_pos.x = u_resolution.x - abs(u_resolution.x - pos.x);
    new_pos.y = u_resolution.y - abs(u_resolution.y - pos.y);
    return new_pos;
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 pos = fragCoord;

    float x1 = texture2D(u_pressure, boundary(fragCoord + vec2(1.0, 0.0))/u_resolution).x;
    float x0 = texture2D(u_pressure, boundary(fragCoord + vec2(-1.0, 0.0))/u_resolution).x;
    float divx = (x1 - x0) / (2.0 * u_dxdy.x);

    float y1 = texture2D(u_pressure, boundary(fragCoord + vec2(0.0, 1.0))/u_resolution).x;
    float y0 = texture2D(u_pressure, boundary(fragCoord + vec2(0.0, -1.0))/u_resolution).x;
    float divy = (y1 - y0) / (2.0 * u_dxdy.y);

    vec2 grad = vec2(divx, divy);
    vec2 velocity = texture2D(u_velocity, fragCoord/u_resolution).xy;
    vec2 new_vel = velocity - grad;

    gl_FragColor = vec4(new_vel, 0.0, 1.0);
}

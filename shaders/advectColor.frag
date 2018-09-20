precision mediump float;

uniform sampler2D u_velocity;
uniform sampler2D u_color;

uniform vec2 u_resolution;
uniform float u_dt;

vec2 boundary(vec2 pos)
{
    vec2 new_pos;
    new_pos.x = abs(pos.x);
    new_pos.y = abs(pos.y);
    new_pos.x = u_resolution.x - abs(u_resolution.x - pos.x);
    new_pos.y = u_resolution.y - abs(u_resolution.y - pos.y);
    return new_pos;
}

vec4 bilinear(sampler2D mat, vec2 pos, vec2 resolution)
{
    vec2 pixel = vec2(0.5);
    vec2 poss = pos - pixel;
    vec2 ij = floor(poss);
    vec2 w = poss - ij;

    vec4 q11 = texture2D(mat, boundary(ij + pixel) /resolution);
    vec4 q21 = texture2D(mat, boundary(ij + pixel + vec2(1.0, 0.0)) /resolution);
    vec4 q12 = texture2D(mat, boundary(ij + pixel + vec2(0.0, 1.0)) /resolution);
    vec4 q22 = texture2D(mat, boundary(ij + pixel + vec2(1.0, 1.0)) /resolution);

    vec4 r1 = (1.0 - w.x) * q11 + (w.x) * q21;
    vec4 r2 = (1.0 - w.x) * q12 + (w.x) * q22;
    vec4 r = (1.0 - w.y) * r1 + (w.y) * r2;

    return r;
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 velocity = bilinear(u_velocity, fragCoord, u_resolution).xy;
    vec2 pos = fragCoord - velocity * u_dt;
    vec4 color = bilinear(u_color, pos, u_resolution);

    gl_FragColor = color;
}

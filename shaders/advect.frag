precision mediump float;

uniform sampler2D u_velocity;
uniform sampler2D u_mat;

uniform vec2 u_resolution;
uniform float u_dt;

vec2 boundary(vec2 poss)
{
    vec2 new_pos;
    vec2 pixel = vec2(0.5);
    vec2 pos = floor(poss - pixel);
    new_pos.x = abs(pos.x);
    new_pos.y = abs(pos.y);
    new_pos.x = u_resolution.x - abs(u_resolution.x - pos.x);
    new_pos.y = u_resolution.y - abs(u_resolution.y - pos.y);
    new_pos += pixel;
    return poss;
}

vec4 bilinear(sampler2D mat, vec2 pos, vec2 resolution)
{
    vec2 pixel = vec2(0.5);
    vec2 poss = pos - pixel;
    vec2 ij = floor(poss);
    vec2 w = poss - ij;

    vec4 q11 = texture2D(mat, (ij + pixel) /resolution);
    vec4 q21 = texture2D(mat, (ij + pixel + vec2(1.0, 0.0)) /resolution);
    vec4 q12 = texture2D(mat, (ij + pixel + vec2(0.0, 1.0)) /resolution);
    vec4 q22 = texture2D(mat, (ij + pixel + vec2(1.0, 1.0)) /resolution);

    vec4 r1 = (1.0 - w.x) * q11 + (w.x) * q21;
    vec4 r2 = (1.0 - w.x) * q12 + (w.x) * q22;
    vec4 r = (1.0 - w.y) * r1 + (w.y) * r2;

    return r;
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 velocity = bilinear(u_velocity, fragCoord, u_resolution).xy;

    if (length(velocity) <= 0.0)
    {
        gl_FragColor = texture2D(u_mat, fragCoord/u_resolution);
        return;
    }

    vec2 pos = fragCoord - velocity * u_dt;
    pos = boundary(pos);
    vec4 color = bilinear(u_mat, pos, u_resolution);

    gl_FragColor = color;
}

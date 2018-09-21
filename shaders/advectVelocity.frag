precision mediump float;

uniform sampler2D u_velocity;

uniform vec2 u_resolution;
uniform float u_dt;


vec4 bilinear(sampler2D mat, vec2 pos, vec2 resolution)
{
    vec2 ij = floor(pos);
    vec2 w = pos - ij;
    vec2 pixel = vec2(0.0);

    vec4 q11 = texture2D(mat, (ij)/resolution);
    vec4 q21 = texture2D(mat, (ij + vec2(1.0, 0.0))/resolution);
    vec4 q12 = texture2D(mat, (ij + vec2(0.0, 1.0))/resolution);
    vec4 q22 = texture2D(mat, (ij + vec2(1.0, 1.0))/resolution);

    vec4 r1 = (1.0 - w.x) * q11 + (w.x) * q21;
    vec4 r2 = (1.0 - w.x) * q12 + (w.x) * q22;
    vec4 r = (1.0 - w.y) * r1 + (w.y) * r2;

    return r;
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;

    vec2 pixel = vec2(0.5);

    vec2 pos0 = fragCoord - pixel;
    vec2 velocity = bilinear(u_velocity, pos0, u_resolution).xy;

    vec2 pos = fragCoord - pixel - velocity * u_dt;
    vec4 color = bilinear(u_velocity, pos, u_resolution);

    gl_FragColor = color;
}

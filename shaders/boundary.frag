precision mediump float;

uniform sampler2D u_mat;
uniform float u_scale;  // velocity boundaries: set to -1; pressure boundaries: set to 1
uniform vec2 u_resolution;

vec2 set_offset(vec2 pos)
{
    vec2 pixel = vec2(0.5);
    vec2 ij = floor(pos - pixel);

    vec2 offset = vec2(0.0);

    // left boundary
    if (ij.x < 0.5)
    {
        offset.x = 1.0;
    }
    // right boundary
    if (ij.x > u_resolution.x - 1.5)
    {
        offset.x = -1.0;
    }
    // bottom boundary
    if (ij.y < 0.5)
    {
        offset.y = 1.0;
    }
    // up boundary
    if (ij.y > u_resolution.y - 1.5)
    {
        offset.y = -1.0;
    }

    return offset;
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 offset = set_offset(fragCoord);
    float scale = (offset == vec2(0.0)) ? 1.0 : u_scale;
    vec4 new = scale * texture2D(u_mat, (fragCoord + offset)/u_resolution);

//    vec4 new = texture2D(u_mat, (fragCoord)/u_resolution);

    gl_FragColor = new;
}

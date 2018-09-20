// reference: http://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch38.html

precision mediump float;

uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_resolution;

uniform float u_alpha;
uniform float u_beta;

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

    float p20 = texture2D(u_pressure, boundary(pos + vec2(2.0, 0.0))/u_resolution).x;
    float p10 = texture2D(u_pressure, boundary(pos + vec2(-2.0, 0.0))/u_resolution).x;
    float p02 = texture2D(u_pressure, boundary(pos + vec2(0.0, 2.0))/u_resolution).x;
    float p01 = texture2D(u_pressure, boundary(pos + vec2(0.0, -2.0))/u_resolution).x;

    float d = texture2D(u_divergence, pos/u_resolution).x;

    float p = (u_alpha * d + p20 + p10 + p02 + p01) / u_beta;

    gl_FragColor = vec4(vec3(p), 1.0);
}

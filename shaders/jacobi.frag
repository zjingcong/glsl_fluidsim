// reference: http://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch38.html

precision mediump float;

uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_resolution;

uniform float u_alpha;
uniform float u_beta;

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;

    vec2 pos = fragCoord;

    float p20 = texture2D(u_pressure, (pos + vec2(2.0, 0.0))/u_resolution).x;
    float p10 = texture2D(u_pressure, (pos + vec2(-2.0, 0.0))/u_resolution).x;
    float p02 = texture2D(u_pressure, (pos + vec2(0.0, 2.0))/u_resolution).x;
    float p01 = texture2D(u_pressure, (pos + vec2(0.0, -2.0))/u_resolution).x;

    float d = texture2D(u_divergence, pos/u_resolution).x;

    float p = (u_alpha * d + p20 + p10 + p02 + p01) / u_beta;

    gl_FragColor = vec4(vec3(p), 1.0);
}

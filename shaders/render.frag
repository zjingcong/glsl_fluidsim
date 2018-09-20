precision mediump float;

uniform sampler2D u_color;
uniform vec2 u_resolution;

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 st = fragCoord/u_resolution;

    vec4 color = texture2D(u_color, st);

    gl_FragColor = color;
}

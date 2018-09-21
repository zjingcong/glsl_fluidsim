precision mediump float;

uniform sampler2D u_color;
uniform vec2 u_resolution;

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 st = fragCoord/u_resolution;
    st.y = 1.0 - st.y;
    vec4 color = texture2D(u_color, st) * 2.0;

    gl_FragColor = color;
}

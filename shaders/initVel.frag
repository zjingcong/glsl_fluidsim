precision mediump float;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 st = fragCoord/vec2(600.0, 600.0);
    vec2 velocity = vec2(sin(20.0 * st.y), sin(20.0 * st.x)) * 0.0;
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}

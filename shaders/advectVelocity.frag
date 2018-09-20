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


//precision mediump float;
//
//        uniform sampler2D u_velocity;
//        uniform sampler2D u_material;
//
//        uniform vec2 u_resolution;
//        float u_scale = 1.0;
//
//        uniform float u_dt;
//
//        void main() {
//
//            vec2 fragCoord = gl_FragCoord.xy;
//
//            vec2 currentVelocity = u_scale*texture2D(u_velocity, fragCoord/u_resolution).xy;
//
//            //implicitly solve advection
//
//            if (length(currentVelocity) == 0.0) {//boundary or no velocity
//                gl_FragColor = vec4(texture2D(u_material, fragCoord/u_resolution).xy, 0, 0);
//                return;
//            }
//
//            vec2 pxCenter = vec2(0.5, 0.5);
//            vec2 pos = fragCoord - pxCenter - u_dt*currentVelocity;
//
//             if (pos.x < 1.0) {
//               gl_FragColor = vec4(1.0, 0, 0, 0);
//               return;
//            }
//            if (pos.x >= u_resolution.x-1.0) {
//                gl_FragColor = vec4(0, 0, 0, 0);
//                //return;
//            }
//            if (pos.x >= u_resolution.x-1.0) pos.x -= u_resolution.x-1.0;
//
//            //periodic boundary in y
//            if (pos.y < 0.0) {
//                pos.y += u_resolution.y-1.0;
//            }
//            if (pos.y >= u_resolution.y-1.0) {
//                pos.y -= u_resolution.y-1.0;
//            }
//
//            //bilinear interp between nearest cells
//            vec2 ceiled = ceil(pos);
//            vec2 floored = floor(pos);
//
//            vec2 n = texture2D(u_material, (ceiled+pxCenter)/u_resolution).xy;//actually ne
//            vec2 s = texture2D(u_material, (floored+pxCenter)/u_resolution).xy;//actually sw
//            if (ceiled.x != floored.x){
//                vec2 se = texture2D(u_material, (vec2(ceiled.x, floored.y)+pxCenter)/u_resolution).xy;
//                vec2 nw = texture2D(u_material, (vec2(floored.x, ceiled.y)+pxCenter)/u_resolution).xy;
//                n = n*(pos.x-floored.x) + nw*(ceiled.x-pos.x);
//                s = se*(pos.x-floored.x) + s*(ceiled.x-pos.x);
//            }
//            vec2 materialVal = n;
//            if (ceiled.y != floored.y){
//                materialVal = n*(pos.y-floored.y) + s*(ceiled.y-pos.y);
//            }
//
//            gl_FragColor = vec4(materialVal, 0, 0);
//        }

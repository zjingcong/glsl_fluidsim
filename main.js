
var shaderManager;
var RENDER_WIDTH;
var RENDER_HEIGHT;
var WIDTH = 300;
var HEIGHT = 300;

var dx = 1.0;
var dy = 1.0;
var dt = 1.0;
var jacobi_iter = 6;

var addColorEnable = false;

function InitShaderPrograms()
{
    shaderManager = ShaderManager();

    // flip color
    shaderManager.loadShaderFromSource(gl, "flip");
    shaderManager.setUniformForProgram("flip", "u_color", 0, "1i");
    shaderManager.setUniformForProgram("flip", "u_resolution", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    // base color
    shaderManager.loadShaderFromSource(gl, "baseColor");
    shaderManager.setUniformForProgram("baseColor", "u_resolution", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    shaderManager.loadShaderFromSource(gl, "baseColor2");
    shaderManager.setUniformForProgram("baseColor2", "u_resolution", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    // color src
    shaderManager.loadShaderFromSource(gl, "addColor");
    shaderManager.setUniformForProgram("addColor", "u_resolution", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    shaderManager.setUniformForProgram("addColor", "u_color", 0, "1i");
    shaderManager.setUniformForProgram("addColor", "u_newcolor", 1, "1i");
    // init velocity
    shaderManager.loadShaderFromSource(gl, "initVel");
    // boundary condition
    shaderManager.loadShaderFromSource(gl, "boundary");
    shaderManager.setUniformForProgram("boundary", "u_resolution", [WIDTH, HEIGHT], "2f");
    shaderManager.setUniformForProgram("boundary", "u_mat", 0, "1i");
    // advect
    shaderManager.loadShaderFromSource(gl, "advect");
    shaderManager.setUniformForProgram("advect", "u_velocity", 0, "1i");
    shaderManager.setUniformForProgram("advect", "u_mat", 1, "1i");
    shaderManager.setUniformForProgram("advect", "u_dt", dt, "1f");
    /// default resolution setting
    shaderManager.setUniformForProgram("advect", "u_resolution", [WIDTH, HEIGHT], "2f");
    // add force
    shaderManager.loadShaderFromSource(gl, "addForce");
    shaderManager.setUniformForProgram("addForce", "u_resolution", [WIDTH, HEIGHT], "2f");
    shaderManager.setUniformForProgram("addForce", "u_resolution_render", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    shaderManager.setUniformForProgram("addForce", "u_dt", dt, "1f");
    shaderManager.setUniformForProgram("addForce", "u_velocity", 0, "1i");
    /// default mouse setting
    shaderManager.setUniformForProgram("addForce", "u_mouseDir", [0.0, 0.0], "2f");
    shaderManager.setUniformForProgram("addForce", "u_mouseLoc", [0.0, 0.0], "2f");
    shaderManager.setUniformForProgram("addForce", "u_r", 0.0, "1f");
    // divergence
    shaderManager.loadShaderFromSource(gl, "divergence");
    shaderManager.setUniformForProgram("divergence", "u_resolution", [WIDTH, HEIGHT], "2f");
    shaderManager.setUniformForProgram("divergence", "u_dxdy", [dx, dy], "2f");
    shaderManager.setUniformForProgram("divergence", "u_velocity", 0, "1i");
    // jabobi method to solve pressure
    shaderManager.loadShaderFromSource(gl, "jacobi");
    shaderManager.setUniformForProgram("jacobi", "u_resolution", [WIDTH, HEIGHT], "2f");
    shaderManager.setUniformForProgram("jacobi", "u_pressure", 0, "1i");
    shaderManager.setUniformForProgram("jacobi", "u_divergence", 1, "1i");
    /// notes: in Poisson-pressure equation, alpha=-dt*dt, beta=4 (different from viscous diffusion equation)
    shaderManager.setUniformForProgram("jacobi", "u_alpha", -dt*dt, "1f");
    shaderManager.setUniformForProgram("jacobi", "u_beta", 4.0, "1f");
    // calculate new velocity from pressure field
    shaderManager.loadShaderFromSource(gl, "velFromPressure");
    shaderManager.setUniformForProgram("velFromPressure", "u_pressure", 0, "1i");
    shaderManager.setUniformForProgram("velFromPressure", "u_velocity", 1, "1i");
    shaderManager.setUniformForProgram("velFromPressure", "u_resolution", [WIDTH, HEIGHT], "2f");
    shaderManager.setUniformForProgram("velFromPressure", "u_dxdy", [dx, dy], "2f");
    // render color to default framebuffer
    shaderManager.loadShaderFromSource(gl, "render");
    shaderManager.setUniformForProgram("render", "u_resolution", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    shaderManager.setUniformForProgram("render", "u_color", 0, "1i");

    // create fields
    /// color
    shaderManager.initTextureFromData("color", RENDER_WIDTH, RENDER_HEIGHT, "HALF_FLOAT", null, true);
    shaderManager.initFrameBufferForTexture("color", true);
    shaderManager.initTextureFromData("nextColor", RENDER_WIDTH, RENDER_HEIGHT, "HALF_FLOAT", null, true);
    shaderManager.initFrameBufferForTexture("nextColor", true);
    shaderManager.initTextureFromData("tmpColor", RENDER_WIDTH, RENDER_HEIGHT, "HALF_FLOAT", null, true);
    shaderManager.initFrameBufferForTexture("tmpColor", true);
    /// velocity
    shaderManager.initTextureFromData("velocity", WIDTH, HEIGHT, "HALF_FLOAT", new Uint16Array(WIDTH*HEIGHT*4), true);
    shaderManager.initFrameBufferForTexture("velocity", true);
    shaderManager.initTextureFromData("nextVelocity", WIDTH, HEIGHT, "HALF_FLOAT", new Uint16Array(WIDTH*HEIGHT*4), true);
    shaderManager.initFrameBufferForTexture("nextVelocity", true);
    /// divergence
    shaderManager.initTextureFromData("divergence", WIDTH, HEIGHT, "HALF_FLOAT", new Uint16Array(WIDTH*HEIGHT*4), true);
    shaderManager.initFrameBufferForTexture("divergence", true);
    /// pressure
    shaderManager.initTextureFromData("pressure", WIDTH, HEIGHT, "HALF_FLOAT", new Uint16Array(WIDTH*HEIGHT*4), true);
    shaderManager.initFrameBufferForTexture("pressure", true);
    shaderManager.initTextureFromData("nextPressure", WIDTH, HEIGHT, "HALF_FLOAT", new Uint16Array(WIDTH*HEIGHT*4), true);
    shaderManager.initFrameBufferForTexture("nextPressure", true);

    // create textures
    shaderManager.initTextureFromImage("bird");
    shaderManager.initTextureFromImage("egg");
}

function InitSim()
{
    console.log("Init Simulation");
    gl.viewport(0, 0, RENDER_WIDTH, RENDER_HEIGHT);

    addColorEnable = true;
    shaderManager.renderToBuffer("baseColor2", [], "color");
    shaderManager.renderToBuffer("flip", ["egg"], "tmpColor");

    // addColorEnable = false;
    // shaderManager.renderToBuffer("baseColor2", [], "tmpColor");
    // shaderManager.renderToBuffer("flip", ["egg"], "color");

    gl.viewport(0, 0, WIDTH, HEIGHT);
    shaderManager.renderToBuffer("initVel", [], "velocity");
}

function Render()
{
    gl.viewport(0, 0, WIDTH, HEIGHT);
    // advect velocity
    shaderManager.setUniformForProgram("advect", "u_resolution", [WIDTH, HEIGHT], "2f");
    shaderManager.renderToBuffer("advect", ["velocity", "velocity"], "nextVelocity");
    // solve velocity boundary
    shaderManager.setUniformForProgram("boundary", "u_scale", -1.0, "1f");
    shaderManager.renderToBuffer("boundary", ["nextVelocity"], "velocity");

    if (mouseEnable == true)
    {
        // add force
        var mouseDir = calculateMouseDir();
        // console.log("Mouse location: " + mouseCoordinates[0] + ", " + mouseCoordinates[1]);
        shaderManager.setUniformForProgram("addForce", "u_mouseDir", mouseDir, "2f");
        shaderManager.setUniformForProgram("addForce", "u_mouseLoc", mouseCoordinates, "2f");
        shaderManager.setUniformForProgram("addForce", "u_r", 0.0005, "1f");
        shaderManager.renderToBuffer("addForce", ["velocity"], "nextVelocity");
        // solve velocity boundary
        shaderManager.setUniformForProgram("boundary", "u_scale", -1.0, "1f");
        shaderManager.renderToBuffer("boundary", ["nextVelocity"], "velocity");

        if (addColorEnable == true)
        {
            // add color src
            gl.viewport(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
            shaderManager.setUniformForProgram("addColor", "u_mouseLoc", mouseCoordinates, "2f");
            shaderManager.setUniformForProgram("addColor", "u_r", 0.0002, "1f");
            shaderManager.renderToBuffer("addColor", ["color", "tmpColor"], "nextColor");
            shaderManager.swapBuffer("color", "nextColor");
        }
    }

    gl.viewport(0, 0, WIDTH, HEIGHT);
    // compute pressure
    shaderManager.renderToBuffer("divergence", ["velocity"], "divergence");
    for (var i = 0; i < jacobi_iter; ++i)
    {
        shaderManager.renderToBuffer("jacobi", ["pressure", "divergence"], "nextPressure");
        // solve pressure boundary
        shaderManager.setUniformForProgram("boundary", "u_scale", 1.0, "1f");
        shaderManager.renderToBuffer("boundary", ["nextPressure"], "pressure");
    }

    // subtract pressure gradient
    shaderManager.renderToBuffer("velFromPressure", ["pressure", "velocity"], "nextVelocity");
    // solve velocity boundary
    shaderManager.setUniformForProgram("boundary", "u_scale", -1.0, "1f");
    shaderManager.renderToBuffer("boundary", ["nextVelocity"], "velocity");

    // advect color
    gl.viewport(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
    shaderManager.setUniformForProgram("advect", "u_resolution", [RENDER_WIDTH, RENDER_HEIGHT], "2f");
    shaderManager.renderToBuffer("advect", ["velocity", "color"], "nextColor");
    shaderManager.swapBuffer("color", "nextColor");
    shaderManager.renderToBuffer("render", ["color"]);
}

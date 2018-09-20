
var shaderManager;
var width = 550;
var height = 550;
var dx = 1.2;
var dy = 1.2;
var dt = 0.5;
var jacobi_iter = 4;

function initShaderPrograms()
{
    shaderManager = ShaderManager();

    // base color
    shaderManager.loadShaderFromSource(gl, "baseColor");
    shaderManager.setUniformForProgram("baseColor", "u_resolution", [width, height], "2f");
    // init velocity
    shaderManager.loadShaderFromSource(gl, "initVel");
    // advect color
    shaderManager.loadShaderFromSource(gl, "advectColor");
    shaderManager.setUniformForProgram("advectColor", "u_resolution", [width, height], "2f");
    shaderManager.setUniformForProgram("advectColor", "u_velocity", 0, "1i");
    shaderManager.setUniformForProgram("advectColor", "u_color", 1, "1i");
    shaderManager.setUniformForProgram("advectColor", "u_dt", dt, "1f");
    // advect velocity
    shaderManager.loadShaderFromSource(gl, "advectVelocity");
    shaderManager.setUniformForProgram("advectVelocity", "u_resolution", [width, height], "2f");
    shaderManager.setUniformForProgram("advectVelocity", "u_velocity", 0, "1i");
    // shaderManager.setUniformForProgram("advectVelocity", "u_material", 1, "1i");
    shaderManager.setUniformForProgram("advectVelocity", "u_dt", dt, "1f");
    // divergence
    shaderManager.loadShaderFromSource(gl, "divergence");
    shaderManager.setUniformForProgram("divergence", "u_resolution", [width, height], "2f");
    shaderManager.setUniformForProgram("divergence", "u_dxdy", [dx, dy], "2f");
    shaderManager.setUniformForProgram("divergence", "u_velocity", 0, "1i");
    // jabobi method to solve pressure
    shaderManager.loadShaderFromSource(gl, "jacobi");
    shaderManager.setUniformForProgram("jacobi", "u_resolution", [width, height], "2f");
    shaderManager.setUniformForProgram("jacobi", "u_pressure", 0, "1i");
    shaderManager.setUniformForProgram("jacobi", "u_divergence", 1, "1i");
    /// notes: in Poisson-pressure equation, alpha=-dt*dt, beta=4 (different from viscous diffusion equation)
    shaderManager.setUniformForProgram("jacobi", "u_alpha", -dt * dt, "1f");
    shaderManager.setUniformForProgram("jacobi", "u_beta", 4.0, "1f");
    // calculate new velocity from pressure field
    shaderManager.loadShaderFromSource(gl, "velFromPressure");
    shaderManager.setUniformForProgram("velFromPressure", "u_pressure", 0, "1i");
    shaderManager.setUniformForProgram("velFromPressure", "u_velocity", 1, "1i");
    shaderManager.setUniformForProgram("velFromPressure", "u_resolution", [width, height], "2f");
    shaderManager.setUniformForProgram("velFromPressure", "u_dxdy", [dx, dy], "2f");
    // render color to default framebuffer
    shaderManager.loadShaderFromSource(gl, "render");
    shaderManager.setUniformForProgram("render", "u_resolution", [width, height], "2f");
    shaderManager.setUniformForProgram("render", "u_color", 0, "1i");

    // create fields
    /// color
    shaderManager.initTextureFromData("color", width, height, "HALF_FLOAT", null, true);
    shaderManager.initFrameBufferForTexture("color", true);
    shaderManager.initTextureFromData("nextColor", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    shaderManager.initFrameBufferForTexture("nextColor", true);
    /// velocity
    shaderManager.initTextureFromData("velocity", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    shaderManager.initFrameBufferForTexture("velocity", true);
    shaderManager.initTextureFromData("nextVelocity", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    shaderManager.initFrameBufferForTexture("nextVelocity", true);
    /// divergence
    shaderManager.initTextureFromData("divergence", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    shaderManager.initFrameBufferForTexture("divergence", true);
    /// pressure
    shaderManager.initTextureFromData("pressure", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    shaderManager.initFrameBufferForTexture("pressure", true);
    shaderManager.initTextureFromData("nextPressure", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    shaderManager.initFrameBufferForTexture("nextPressure", true);
    /// test
    shaderManager.initTextureFromData("test", width, height, "HALF_FLOAT", null, true);
    shaderManager.initFrameBufferForTexture("test", true);
}

function initSim()
{
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log("Init Simulation");
    shaderManager.renderToBuffer("initVel", [], "velocity");
    shaderManager.renderToBuffer("baseColor", [], "color");
}

function render()
{
    shaderManager.renderToBuffer("advectVelocity", ["velocity"], "nextVelocity");
    shaderManager.swapBuffer("velocity", "nextVelocity");

    shaderManager.renderToBuffer("divergence", ["velocity"], "divergence");

    for (var i = 0; i < jacobi_iter; ++i)
    {
        shaderManager.renderToBuffer("jacobi", ["pressure", "divergence"], "nextPressure");
        shaderManager.swapBuffer("pressure", "nextPressure");
    }

    shaderManager.renderToBuffer("velFromPressure", ["pressure", "velocity"], "nextVelocity");
    shaderManager.swapBuffer("velocity", "nextVelocity");

    shaderManager.renderToBuffer("advectColor", ["nextVelocity", "color"], "nextColor");
    shaderManager.swapBuffer("color", "nextColor");
    shaderManager.renderToBuffer("render", ["color"]);
}

/*
Reference:
    http://www.webgltutorials.org
    https://github.com/amandaghassaei/VortexShedding
*/


var shaders = [
    "flip",
    "addColor",
    "baseColor",
    "baseColor2",
    "initVel",
    "boundary",
    "addForce",
    "divergence",
    "jacobi",
    "velFromPressure",
    "advect",
    "render"
];

var texs = [
    "bird",
    "egg"
];


var global_vert_shader = "global.vert";

var fs_list = {};
var vs_list = {};
var img_list = {};

function LoadShaderSource()
{
    for (i in shaders)
    {
        console.log("Load shader " + i + ": " + shaders[i] + "...");
        LoadShaderSourceFromFile(shaders[i], global_vert_shader, shaders[i] + ".frag", i);
    }
}

function LoadShaderSourceFromFile(shaderName, filenameVertexShader, filenameFragmentShader, i)
{
    // Folder where your shaders are located
    var ShaderDirectory = "shaders";

    var filename_vs = ShaderDirectory + "/" + filenameVertexShader;
    var filename_fs = ShaderDirectory + "/" + filenameFragmentShader;

    console.log("filename_vs: " + filename_vs + "filename_fs: " + filename_fs);

    var v = ""; // Placeholders for the shader pair
    var f = "";

    // Now execute two Ajax calls in a row to grab the vertex and
    // fragment shaders from the file location
    var xmlhttp = new XMLHttpRequest();
    // Execute first Ajax call to load the vertex shader
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {

                v = xmlhttp.responseText;

                // Execute second Ajax call to load the fragment shader
                var xmlhttp2 = new XMLHttpRequest();
                xmlhttp2.onreadystatechange = function () {
                    if (xmlhttp2.readyState === XMLHttpRequest.DONE)
                        if (xmlhttp2.status === 200) {
                            f = xmlhttp2.responseText;

                            fs_list[shaderName] = f;
                            vs_list[shaderName] = v;

                            if (i == (shaders.length - 1))
                                window.webGLResourcesLoaded();
                        }
                };
                xmlhttp2.open("GET", filename_fs, true);
                xmlhttp2.send();
            }
        }
    };
    xmlhttp.open("GET", filename_vs, true);
    xmlhttp.send();
}

function LoadImages()
{
    console.log("Load textures...");
    for (i in texs)
    {
        var texturefile = "resources" + "/" + texs[i] + ".png";
        LoadImageFromFile(texs[i], texturefile);
    }
}

function LoadImageFromFile(name, image_src)
{
    var image = new Image();
    image.src = image_src;
    image.addEventListener("load", function() {
        var w = image.width;
        var h = image.height;
        console.log("Texture Image Width: " + w);
        console.log("Texture Image Height: " + h);
        img_list[name] = image;
        window.WebGLImageLoaded();
    })
}


function isPowerOf2(value)
{
    return (value & (value - 1)) == 0;
}


function ShaderManager() {
    var glBoilerplate = initBoilerPlate();
    var ext = gl.getExtension("OES_texture_half_float") || gl.getExtension("EXT_color_buffer_half_float");


    function Shader() {
        console.log("New shader");
        this.reset();
    }

    Shader.prototype.loadShaderFromSource = function(gl, programName)
    {
        var programe;
        if (!vs_list[programName] || !fs_list[programName])
        {
            console.log("No shader program named " + programName);
            return;
        }
        var v = vs_list[programName];
        var f = fs_list[programName];
        programe = glBoilerplate.createProgramFromSource(gl, v, f);
        gl.useProgram( programe ); // Use the program
        glBoilerplate.loadVertexData(gl, programe);
        this.programs[programName] =
            {
                program: programe,
                uniforms: {}
            };
    };

    Shader.prototype.setUniformForProgram = function(programName, name, val, type)
    {
        if (!this.programs[programName]){
            console.warn("no program with name " + programName);
            return;
        }
        gl.useProgram( this.programs[programName].program );
        var uniforms = this.programs[programName].uniforms;
        var location = uniforms[name];
        if (!location) {
            location = gl.getUniformLocation(this.programs[programName].program, name);
            uniforms[name] = location;
        }
        if (type == "1f") gl.uniform1f(location, val);
        else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
        else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
        else if (type == "1i") gl.uniform1i(location, val);
        else {
            console.warn("no uniform for type " + type);
        }
    };

    Shader.prototype.initTextureFromData = function(name, width, height, typeName, data, shouldReplace)
    {
        var texture = this.textures[name];
        if (!shouldReplace && texture) {
            console.warn("Already a texture with the name " + name);
            return;
        }
        var type;
        if (typeName == "HALF_FLOAT") type = ext.HALF_FLOAT_OES;
        else type = gl[typeName];
        texture = glBoilerplate.makeTexture(gl, width, height, type, null);
        this.textures[name] = texture;
    };

    Shader.prototype.initTextureFromImage = function(name)
    {
        var texture = this.textures[name];
        if (texture) {
            console.warn("Already a texture with the name " + name);
            return;
        }

        var image = img_list[name];
        if (!image)
        {
            console.warn("No image named " + name);
            return;
        }

        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            // No, it's not a power of 2. Turn of mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        this.textures[name] = texture;
    };

    Shader.prototype.initFrameBufferForTexture = function(textureName, shouldReplace)
    {
        if (!shouldReplace) {
            var framebuffer = this.frameBuffers[textureName];
            if (framebuffer) {
                console.warn("framebuffer already exists for texture " + textureName);
                return;
            }
        }
        var texture = this.textures[textureName];
        if (!texture){
            console.warn("texture " + textureName + " does not exist");
            return;
        }

        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        var check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(check != gl.FRAMEBUFFER_COMPLETE){
            console.warn("Floating point textures are not supported on your system");
        }

        this.frameBuffers[textureName] = framebuffer;
    };

    Shader.prototype.swapBuffer = function(texture1, texture2)
    {
        // swap texture
        var tmp_texture = this.textures[texture1];
        this.textures[texture1] = this.textures[texture2];
        this.textures[texture2] = tmp_texture;
        // swap framebuffer
        var tmp_framebuffer = this.frameBuffers[texture1];
        this.frameBuffers[texture1] = this.frameBuffers[texture2];
        this.frameBuffers[texture2] = tmp_framebuffer;
    };

    Shader.prototype.renderToBuffer = function(programName, inputTextures, outputTexture)
    {
        gl.useProgram(this.programs[programName].program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Enable color; required for clearing the screen
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (var i=0;i<inputTextures.length;i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[inputTextures[i]]);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
    };

    Shader.prototype.reset = function ()
    {
        this.programs = {};
        this.frameBuffers = {};
        this.textures = {};
    };

    return new Shader;
}

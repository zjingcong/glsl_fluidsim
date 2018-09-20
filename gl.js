
// reference: http://www.webgltutorials.org

var lastMouseCoordinates =  [0, 0];
var mouseCoordinates =  [0, 0];
var mouseEnable = false;

// Get WebGL context, if standard is not available; fall back on alternatives
function GetWebGLContext( canvas )
{
    // Standard
    return canvas.getContext("webgl") ||
        // Alternative; Safari, others
        canvas.getContext("experimental-webgl") ||
        // Firefox; mozilla
        canvas.getContext("moz-webgl") ||
        // Last resort; Safari, and maybe others
        canvas.getContext("webkit-3d");
}

function InitializeWebGL()
{
    // Get a handle to canvas tag
    var canvas = document.getElementById("gl");

    // WebGL rendering context
    var gl = null;

    // Array that will store a list of supported extensions
    var extensions = null;

    // ! used twice in a row to cast object state to a Boolean value
    if (!!window.WebGLRenderingContext == true)
    {
        // Initialize WebGL rendering context, if available
        if ( gl = GetWebGLContext( canvas ) )
        {
            console.log("WebGL is initialized.");

            // Ensure OpenGL viewport is resized to match canvas dimensions
            RENDER_WIDTH = canvas.width;
            RENDER_HEIGHT = canvas.height;

            canvas.onmousemove = onMouseMove;
            canvas.onmousedown = onMouseDown;
            canvas.onmouseup = onMouseUp;

            gl.viewportWidth = RENDER_WIDTH;
            gl.viewportHeight = RENDER_HEIGHT;

            // Output the WebGL rendering context object to console for reference
            console.log( gl );

            // List available extensions
            // console.log( extensions = gl.getSupportedExtensions() );

            // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // Enable color; required for clearing the screen
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Clear out the viewport with solid black color
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

            return gl;
        }
        else
            console.log("Your browser doesn't support WebGL.");
    }
    else
        console.log("WebGL is supported, but disabled :-(");
}

// events callback
function onMouseMove(e)
{
    lastMouseCoordinates = mouseCoordinates;
    mouseCoordinates = [e.clientX, RENDER_HEIGHT-e.clientY];
}

function onMouseDown()
{
    mouseEnable = true;
}

function onMouseUp()
{
    mouseEnable = false;
}

function calculateMouseDir()
{
    return [mouseCoordinates[0] - lastMouseCoordinates[0], mouseCoordinates[1] - lastMouseCoordinates[1]];
}

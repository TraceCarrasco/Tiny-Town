var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Light = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Lights - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Lights
    Light = function Light(name, position, color, skew) {
        this.name = name;
        this.position = position || [0,0,0];
        this.color = color || [.2,.2,.2];
        this.skew = skew;
    }
    Light.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var x1 = -6.5;
        var x2 = 0.5;
        var y1 = -0.5;
        var y2 = 1.0;
        var z1 = -0.5;
        var z2 = 0.5;

        var xc1 = 10.0;
        var yc1 = 4.5;
        var zc1 = 0.0;

        var x_1 = 0.0;
        var x_2 = 0.5;
        var y_1 = -50.0;
        var y_2 = 2.0;
        var z_1 = -2.0;
        var z_2 = 2.0;

        var x_c1 = 3.0;
        var y_c1 = 4.5;
        var z_c1 = 0.0;

        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["light-vs", "light-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    10,4,0, 14,0,3, 14,0,-3, 10,4,0, 6,0,3, 6,0,-3,
                    10,4,0, 14,0,3, 6,0,3, 10,4,0, 14,0,-3, 6,0,-3,
                    10,-8,0, 14,0,3, 6,0,3, 10,-8,0, 6,0,3, 6,0,-3,
                    10,-8,0, 6,0,-3, 14,0,-3, 10,-8,0, 14,0,-3, 14,0,3,
                    x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1,        x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1, x1+xc1,y2+yc1,z1+zc1,    
                    x1+xc1,y1+yc1,z2+zc1,  x2+xc1,y1+yc1,z2+zc1,  x2+xc1,y2+yc1,z2+zc1,        x1+xc1,y1+yc1,z2+zc1,  x2+xc1,y2+yc1,z2+zc1, x1+xc1,y2+yc1,z2+zc1,    
                    x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z2+zc1,        x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z2+zc1, x1+xc1,y1+yc1,z2+zc1,    
                    x1+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1,        x1+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1, x1+xc1,y2+yc1,z2+zc1,    
                    x1+xc1,y1+yc1,z1+zc1,  x1+xc1,y2+yc1,z1+zc1,  x1+xc1,y2+yc1,z2+zc1,        x1+xc1,y1+yc1,z1+zc1,  x1+xc1,y2+yc1,z2+zc1, x1+xc1,y1+yc1,z2+zc1,    
                    x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1,        x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1, x2+xc1,y1+yc1,z2+zc1,

                    x_1+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_1+z_c1,        x_1+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_1+z_c1, x_1+x_c1,y_2+y_c1,z_1+z_c1,    
                    x_1+x_c1,y_1+y_c1,z_2+z_c1,  x_2+x_c1,y_1+y_c1,z_2+z_c1,  x_2+x_c1,y_2+y_c1,z_2+z_c1,        x_1+x_c1,y_1+y_c1,z_2+z_c1,  x_2+x_c1,y_2+y_c1,z_2+z_c1, x_1+x_c1,y_2+y_c1,z_2+z_c1,    
                    x_1+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_1+y_c1,z_2+z_c1,        x_1+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_1+y_c1,z_2+z_c1, x_1+x_c1,y_1+y_c1,z_2+z_c1,    
                    x_1+x_c1,y_2+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_2+z_c1,        x_1+x_c1,y_2+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_2+z_c1, x_1+x_c1,y_2+y_c1,z_2+z_c1,    
                    x_1+x_c1,y_1+y_c1,z_1+z_c1,  x_1+x_c1,y_2+y_c1,z_1+z_c1,  x_1+x_c1,y_2+y_c1,z_2+z_c1,        x_1+x_c1,y_1+y_c1,z_1+z_c1,  x_1+x_c1,y_2+y_c1,z_2+z_c1, x_1+x_c1,y_1+y_c1,z_2+z_c1,    
                    x_2+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_2+z_c1,        x_2+x_c1,y_1+y_c1,z_1+z_c1,  x_2+x_c1,y_2+y_c1,z_2+z_c1, x_2+x_c1,y_1+y_c1,z_2+z_c1,
                ] },
                vnormal : {numComponents:3, data: [
                    1,1,0, 1,1,0, 1,1,0, -1,1,0, -1,1,0, -1,1,0, 
                    1,1,1, 1,1,1, 1,1,1, 1,1,-1, 1,1,-1, 1,1,-1,
                    0,-1,-1, 0,-1,-1, 0,-1,-1, 1,-1,0, 1,-1,0, 1,-1,0, 
                    0,-1,1, 0,-1,1, 0,-1,1, -1,-1,0, -1,-1,0, -1,-1,0,
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }
    };
    Light.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Light in the world
        var modelM = twgl.m4.scaling([this.skew[0],this.skew[1],this.skew[2]]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Light.prototype.center = function(drawingState) {
        return this.position;
    }
})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of Lights, just don't load this file.
grobjects.push(new Light("Light1",[-4.5,2.33,   2.7],[1.0,1.0,.8], [.051,.051,-.051]) );



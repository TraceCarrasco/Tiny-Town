var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Garage = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Garages - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Garages
    Garage = function Garage(name, position, color, skew) {
        this.name = name;
        this.position = position || [0,0,0];
        this.color = color || [.7,.8,.9];
        this.skew = skew;
    }
    Garage.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Garages
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["structure-vs", "structure-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    // Front Door
                    -2,0,-2, -2,2,-2, -1.5,2,-2, -1.5,2,-2, -2,0,-2, -1.5,0,-2,
                    -1.5,2,-2, 1.5,2,-2, 1.5,1.5,-2, -1.5,2,-2, 1.5,1.5,-2, -1.5,1.5,-2,
                    2,0,-2, 2,2,-2, 1.5,2,-2, 1.5,2,-2, 2,0,-2, 1.5,0,-2,
                    // Sides
                    2,2,-2, 2,0,-4, 2,0,-2, 2,2,-2, 2,0,-4, 2,2,-4,
                    2,0,-4, 2,2,-4, -2,2,-4, 2,0,-4, -2,0,-4, -2,2,-4,
                    -2,2,-4, -2,2,-2, -2,0,-4, -2,0,-4, -2,0,-2, -2,2,-2,
                    // Roof
                    2,2,-2, 0,3,-2, -2,2,-2,  2,2,-2, 0,3,-2, -2,2,-2, 
                    2,2,-4, 0,3,-4, -2,2,-4,  2,2,-4, 0,3,-4, -2,2,-4,
                    2,2,-2, 2,2,-4, 0,3,-4, 0,3,-4, 0,3,-2, 2,2,-2, 
                    -2,2,-2, -2,2,-4, 0,3,-4, 0,3,-4, 0,3,-2, -2,2,-2,
                    // Ceiling
                    -2,2,-2, 2,2,-2,2,2,-4,2,2,-4,-2,2,-4,-2,2,-2
                ] },
                vnormal : {numComponents:3, data: [
                    // Front Garage
                     0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                     0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                     0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    // Sides
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    // Roof
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    // Ceiling
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Garage.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Garage in the world
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
    Garage.prototype.center = function(drawingState) {
        return this.position;
    }
})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of Garages, just don't load this file.
grobjects.push(new Garage("Garage1",[0,0,   4],[0.5,0.25,0.0], [1,1,1]) );



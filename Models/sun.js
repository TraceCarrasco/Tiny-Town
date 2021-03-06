var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Sun = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Suns - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Suns
    Sun = function Sun(name, position, color, skew) {
        this.name = name;
        this.position = position || [0,0,0];
        this.color = color || [.7,.8,.9];
        this.skew = skew;
        this.radius = WorldSize + 1;
    }
    Sun.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Suns
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["sun-vs", "sun-fs"]);
        }
        if (!buffers) {
            var r = this.radius + MaxYPoint.point;
            var gen = new Generate();
            var planes = [
                0,0+r,1, 0.5,1+r,0, 1,0+r,0,
                0,0+r,1, 1,0+r,0, 0.5,-1+r,0,
                0,0+r,1, 0.5,-1+r,0, -0.5,-1+r,0, 
                0,0+r,1, -0.5,-1+r,0, -1,0+r,0,
                0,0+r,1, -1,0+r,0, -0.5,1+r,0,
                0,0+r,1, -0.5,1+r,0, 0.5,1+r,0,
                0,0+r,-1, 0.5,1+r,0, 1,0+r,0,
                0,0+r,-1, 1,0+r,0, 0.5,-1+r,0,
                0,0+r,-1, 0.5,-1+r,0, -0.5,-1+r,0, 
                0,0+r,-1, -0.5,-1+r,0, -1,0+r,0,
                0,0+r,-1, -1,0+r,0, -0.5,1+r,0,
                0,0+r,-1, -0.5,1+r,0, 0.5,1+r,0,
            ];
            var normals = gen.generateVNormalData(planes);
            var arrays = {
                vpos : { numComponents: 3, data: planes},
                vnormal : {numComponents:3, data: normals}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Sun.prototype.draw = function(drawingState) {
        var date = new Date;
        var time = date.getSeconds() + date.getMilliseconds()/1000;
        var rotation = modelM = twgl.m4.axisRotation([0,0,1], this.calculateRotation(time));
        var slider = document.getElementById('TimeOfDay')
        
        //slider.value = 30;
        slider.value = time / 2.5;
        
        
        // we make a model matrix to place the Sun in the world
        var scale = twgl.m4.scaling([this.skew[0],this.skew[1],this.skew[2]]);
        
        var modelM = twgl.m4.multiply(scale,rotation);
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
    Sun.prototype.center = function(drawingState) {
        return this.position;
    }
    Sun.prototype.calculateRotation = function (time) {
        var angle = 0;
        if(time >= 30)
            angle = (((time-30)/(15))*90)*((Math.PI)/(-180));
         else
             angle = ((Math.PI)/(2))-(((time-15)/(15))*90)*((Math.PI)/(180));
        return angle;
    }    
})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of Suns, just don't load this file.
grobjects.push(new Sun("Sun",[0,0,   0],[1.5,3.0,0.5], [1,1,1]));



(function() {
    var shaderProgram = undefined;
    var buffers = undefined;

    RiverReflection = function RiverReflection() {
        this.name = 'RiverReflection';
        this.position = [0,0,0];
        this.size = 1;
    };
    RiverReflection.prototype.init = function(drawingState,river) {
        var gl=drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["riverReflection-vs", "riverReflection-fs"]);
        }
        
        if (!buffers) 
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,river);
            
    };
    RiverReflection.prototype.draw = function(drawingState) {
        
        // Modeled off of WebGL Dynamic Cubemap: http://math.hws.edu/graphicsbook/source/webgl/cube-camera.html
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var modelM = twgl.m4.setTranslation(modelM,this.position);
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        var newView = twgl.m4.multiply(modelM, drawingState.view);
        // need to inverse it so that the reflection looks natural, otherwise its backwards
        newView = twgl.m4.inverse(newView);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            model: modelM, fView: newView});
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    RiverReflection.prototype.center = function(drawingState) {
        return this.position;
    }
})();

var RiverReflection = new RiverReflection();
grobjects.push(RiverReflection);
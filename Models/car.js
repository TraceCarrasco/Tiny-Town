var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Car = undefined;
var goalNumber = 0;
var turnNumber = 0;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Cars - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var carBodyBuffers = undefined;

    // constructor for Cars
    Car = function Car(name, position, color, skew) {
        this.name = name;
        this.position = position || [0,0,0];
        this.color = color || [.7,.8,.9];
        this.skew = skew;
        this.orientation = 0;
        this.rotation = 0;
    }
    Car.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Cars
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["car-vs", "car-fs"]);
        }

        var generator = new Generate();

        // "Wheel" kinda, but all the wheels are just transforms of this
        var x1 = -0.5;
        var x2 = 0.5;
        var y1 = -0.5;
        var y2 = 0.5;
        var z1 = -0.5;
        var z2 = 0.5;

        var xc1 = 1.5;
        var yc1 = 0.5;
        var zc1 = 0.5;

        var xc2 = 1.5;
        var yc2 = 0.5;
        var zc2 = 2.5;

        var xc3 = 5.5;
        var yc3 = 0.5;
        var zc3 = 2.5;

        var xc4 = 5.5;
        var yc4 = 0.5;
        var zc4 = 0.5;
        if (!carBodyBuffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    // Body
                    0,1,0, 7,1,0, 7,3,0, 7,3,0, 0,3,0, 0,1,0,
                    0,1,3, 7,1,3, 7,3,3, 7,3,3, 0,3,3, 0,1,3,
                    7,1,0, 7,1,3, 7,3,3, 7,3,3, 7,3,0, 7,1,0,
                    0,1,0, 0,1,3, 0,3,3, 0,3,3, 0,3,0, 0,1,0,
                    0,3,0, 7,3,0, 7,3,3, 7,3,3, 0,3,3, 0,3,0,
                    0,1,0, 7,1,0, 7,1,3, 7,1,3, 0,1,3, 0,1,0,
                    // Top
                    2,3,0, 6,3,0, 6,5,0, 6,5,0, 2,5,0, 2,3,0,
                    2,3,3, 6,3,3, 6,5,3, 6,5,3, 2,5,3, 2,3,3,
                    6,3,0, 6,3,3, 6,5,3, 6,5,3, 6,5,0, 6,3,0,
                    2,3,0, 2,3,3, 2,5,3, 2,5,3, 2,5,0, 2,3,0,
                    2,5,0, 6,5,0, 6,5,3, 6,5,3, 2,5,3, 2,5,0,
                     // Back Left wheel
                    x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1,        x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1, x1+xc1,y2+yc1,z1+zc1,    
                    x1+xc1,y1+yc1,z2+zc1,  x2+xc1,y1+yc1,z2+zc1,  x2+xc1,y2+yc1,z2+zc1,        x1+xc1,y1+yc1,z2+zc1,  x2+xc1,y2+yc1,z2+zc1, x1+xc1,y2+yc1,z2+zc1,    
                    x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z2+zc1,        x1+xc1,y1+yc1,z1+zc1,  x2+xc1,y1+yc1,z2+zc1, x1+xc1,y1+yc1,z2+zc1,    
                    x1+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1,        x1+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1, x1+xc1,y2+yc1,z2+zc1,    
                    x1+xc1,y1+yc1,z1+zc1,  x1+xc1,y2+yc1,z1+zc1,  x1+xc1,y2+yc1,z2+zc1,        x1+xc1,y1+yc1,z1+zc1,  x1+xc1,y2+yc1,z2+zc1, x1+xc1,y1+yc1,z2+zc1,    
                    x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1,        x2+xc1,y1+yc1,z1+zc1,  x2+xc1,y2+yc1,z2+zc1, x2+xc1,y1+yc1,z2+zc1,     
                    // Back Right wheel
                    x1+xc2,y1+yc2,z1+zc2,  x2+xc2,y1+yc2,z1+zc2,  x2+xc2,y2+yc2,z1+zc2,        x1+xc2,y1+yc2,z1+zc2,  x2+xc2,y2+yc2,z1+zc2, x1+xc2,y2+yc2,z1+zc2,    
                    x1+xc2,y1+yc2,z2+zc2,  x2+xc2,y1+yc2,z2+zc2,  x2+xc2,y2+yc2,z2+zc2,        x1+xc2,y1+yc2,z2+zc2,  x2+xc2,y2+yc2,z2+zc2, x1+xc2,y2+yc2,z2+zc2,    
                    x1+xc2,y1+yc2,z1+zc2,  x2+xc2,y1+yc2,z1+zc2,  x2+xc2,y1+yc2,z2+zc2,        x1+xc2,y1+yc2,z1+zc2,  x2+xc2,y1+yc2,z2+zc2, x1+xc2,y1+yc2,z2+zc2,    
                    x1+xc2,y2+yc2,z1+zc2,  x2+xc2,y2+yc2,z1+zc2,  x2+xc2,y2+yc2,z2+zc2,        x1+xc2,y2+yc2,z1+zc2,  x2+xc2,y2+yc2,z2+zc2, x1+xc2,y2+yc2,z2+zc2,    
                    x1+xc2,y1+yc2,z1+zc2,  x1+xc2,y2+yc2,z1+zc2,  x1+xc2,y2+yc2,z2+zc2,        x1+xc2,y1+yc2,z1+zc2,  x1+xc2,y2+yc2,z2+zc2, x1+xc2,y1+yc2,z2+zc2,    
                    x2+xc2,y1+yc2,z1+zc2,  x2+xc2,y2+yc2,z1+zc2,  x2+xc2,y2+yc2,z2+zc2,        x2+xc2,y1+yc2,z1+zc2,  x2+xc2,y2+yc2,z2+zc2, x2+xc2,y1+yc2,z2+zc2,     
                    // Front Right wheel
                    x1+xc3,y1+yc3,z1+zc3,  x2+xc3,y1+yc3,z1+zc3,  x2+xc3,y2+yc3,z1+zc3,        x1+xc3,y1+yc3,z1+zc3,  x2+xc3,y2+yc3,z1+zc3, x1+xc3,y2+yc3,z1+zc3,    
                    x1+xc3,y1+yc3,z2+zc3,  x2+xc3,y1+yc3,z2+zc3,  x2+xc3,y2+yc3,z2+zc3,        x1+xc3,y1+yc3,z2+zc3,  x2+xc3,y2+yc3,z2+zc3, x1+xc3,y2+yc3,z2+zc3,    
                    x1+xc3,y1+yc3,z1+zc3,  x2+xc3,y1+yc3,z1+zc3,  x2+xc3,y1+yc3,z2+zc3,        x1+xc3,y1+yc3,z1+zc3,  x2+xc3,y1+yc3,z2+zc3, x1+xc3,y1+yc3,z2+zc3,    
                    x1+xc3,y2+yc3,z1+zc3,  x2+xc3,y2+yc3,z1+zc3,  x2+xc3,y2+yc3,z2+zc3,        x1+xc3,y2+yc3,z1+zc3,  x2+xc3,y2+yc3,z2+zc3, x1+xc3,y2+yc3,z2+zc3,    
                    x1+xc3,y1+yc3,z1+zc3,  x1+xc3,y2+yc3,z1+zc3,  x1+xc3,y2+yc3,z2+zc3,        x1+xc3,y1+yc3,z1+zc3,  x1+xc3,y2+yc3,z2+zc3, x1+xc3,y1+yc3,z2+zc3,    
                    x2+xc3,y1+yc3,z1+zc3,  x2+xc3,y2+yc3,z1+zc3,  x2+xc3,y2+yc3,z2+zc3,        x2+xc3,y1+yc3,z1+zc3,  x2+xc3,y2+yc3,z2+zc3, x2+xc3,y1+yc3,z2+zc3,    
                    // Front Left wheel
                    x1+xc4,y1+yc4,z1+zc4,  x2+xc4,y1+yc4,z1+zc4,  x2+xc4,y2+yc4,z1+zc4,        x1+xc4,y1+yc4,z1+zc4,  x2+xc4,y2+yc4,z1+zc4, x1+xc4,y2+yc4,z1+zc4,    
                    x1+xc4,y1+yc4,z2+zc4,  x2+xc4,y1+yc4,z2+zc4,  x2+xc4,y2+yc4,z2+zc4,        x1+xc4,y1+yc4,z2+zc4,  x2+xc4,y2+yc4,z2+zc4, x1+xc4,y2+yc4,z2+zc4,    
                    x1+xc4,y1+yc4,z1+zc4,  x2+xc4,y1+yc4,z1+zc4,  x2+xc4,y1+yc4,z2+zc4,        x1+xc4,y1+yc4,z1+zc4,  x2+xc4,y1+yc4,z2+zc4, x1+xc4,y1+yc4,z2+zc4,    
                    x1+xc4,y2+yc4,z1+zc4,  x2+xc4,y2+yc4,z1+zc4,  x2+xc4,y2+yc4,z2+zc4,        x1+xc4,y2+yc4,z1+zc4,  x2+xc4,y2+yc4,z2+zc4, x1+xc4,y2+yc4,z2+zc4,    
                    x1+xc4,y1+yc4,z1+zc4,  x1+xc4,y2+yc4,z1+zc4,  x1+xc4,y2+yc4,z2+zc4,        x1+xc4,y1+yc4,z1+zc4,  x1+xc4,y2+yc4,z2+zc4, x1+xc4,y1+yc4,z2+zc4,    
                    x2+xc4,y1+yc4,z1+zc4,  x2+xc4,y2+yc4,z1+zc4,  x2+xc4,y2+yc4,z2+zc4,        x2+xc4,y1+yc4,z1+zc4,  x2+xc4,y2+yc4,z2+zc4, x2+xc4,y1+yc4,z2+zc4,   

                ] },
                vnormal : {numComponents:3, data: [
                    // Body
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    // Top
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    // Back Left wheel
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    // Back Right wheel
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    // Front Right wheel
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    // Front Left wheel
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            //arrays["indices"] = generator.generateIndices4(arrays.vpos.data.length);
            carBodyBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }
        this.state = 0;
        this.lastTime = 0;
        this.wait = 0;
    };
    Car.prototype.draw = function(drawingState) {   
        advance(this, drawingState); 
        var modelM = twgl.m4.rotationY(this.orientation);
        modelM = twgl.m4.multiply(modelM, twgl.m4.scaling([this.skew[0],this.skew[1],this.skew[2]]));
        // we make a model matrix to place the cube in the world
        //var modelM = twgl.m4.rotationY(this.orientation);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.setBuffersAndAttributes(gl,shaderProgram,carBodyBuffers);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, carBodyBuffers);
    };
    Car.prototype.center = function(drawingState) {
        return this.position;
    }

    var speed = 3/100;          // units per milli-second
    var turningSpeed = 2/1000;         // radians per milli-second
    // right front [-3,0,3], left front[3,0,3]
    var goals = [[3,0,3],[-3,0,3],[-3,0,-3],[3,0,-3]];
    
    function advance(car, drawingState) {
        // on the first call, the car does nothing
        if (!car.lastTime) {
            car.lastTime = drawingState.realtime;
            return;
        }
        var delta = drawingState.realtime - car.lastTime;
        car.lastTime = drawingState.realtime;
        

        // now do the right thing depending on state
        switch (car.state) {
            case 0: // Initialization
                if (car.wait > 0) { car.wait -= delta; }
                else {
                    car.state = 1;
                    car.wait = 10;
                    car.dir = Math.PI/2;
                }
                break;
            case 1: // To goal 1
                var x = car.position[0];
                var y = car.position[1];
                var z = car.position[2];
                // close enough to goal
                if(closeEnough([x,y,z],goals[goalNumber])) {
                    // put car at the goal
                    car.position[0] = goals[goalNumber][0];
                    car.position[1] = goals[goalNumber][1];
                    car.position[2] = goals[goalNumber][2];
                    // go to the next goal or loop back around
                    if(goalNumber === goals.length - 1)
                        goalNumber = 0;
                    else
                        goalNumber = goalNumber + 1;
                    car.dir = car.dir - Math.PI/2;
                    car.state = 2;
                }
                // Otherwise move towards the goal!
                else {
                    // x direction
                    if(x > goals[goalNumber][0])
                        car.dx = -speed;
                    else
                        car.dx = speed;
                    // y direction
                    if(y > goals[goalNumber][1])
                        car.dy = -speed;
                    else
                        car.dy = speed;
                    // z direction
                    if(z > goals[goalNumber][2])
                        car.dz = -speed;
                    else
                        car.dz = speed;
                    if(Math.abs(car.dx) < 0.02)
                        car.dx = 0;
                    if(Math.abs(car.dz) < 0.03)
                        car.dz = 0;
                    car.position[0] += car.dx;
                    //car.position[1] += car.dy;
                    car.position[2] += car.dz;
                }
                break;
                case 2: // Turn 90 degrees
                    var dtheta = car.dir - car.orientation;
                    // if we're close, pretend we're there
                    if (Math.abs(dtheta) < .01) {
                        car.state = 1;
                        car.orientation = car.dir;
                    }
                    var rotAmt = turningSpeed * delta;
                    if (dtheta > 0) {
                        car.orientation = car.orientation+rotAmt;
                    } else {
                        car.orientation = car.orientation-rotAmt;
                    }
                break;
            break;
        }

        function closeEnough(curr,goal) {

            if(Math.abs(curr[0]-goal[0]+curr[1]-goal[1]+curr[2]-goal[2]) < .01)
                return true;
            return false;
        }
    }
})();


// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of Cars, just don't load this file.
grobjects.push(new Car("car1",[3,0,   3],[0.82,0.1,0.1], [.25,.25,.25]) );





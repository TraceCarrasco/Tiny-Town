var grobjects = grobjects || [];
var RiverVPos = RiverVPos || [];
var World = undefined;
var WorldSize = 50;
var MinYPoint = undefined;
var MaxYPoint = undefined;

// Holds the "left"/"right" edges of each river
var RiverBankLocations = [];

(function () {   
    "use strict";
    var shaderProgram = undefined;
    var buffers = undefined;
    var grid = undefined;
    var tempDrawingState = undefined;

    World = function(xWidth, yHeight, zDepth) {        
        this.name = "World";
        this.up = [0.0,1.0,0.0];
        this.position = [0.0,0.0,0.0];     
        this.dayColor = [.0,.8,.0];   
        this.nightColor = [.9,1.0,.9];   
        this.width = xWidth;
        this.height = yHeight;
        this.depth = zDepth;
        this.texture = null;
    }
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }
    World.prototype.init = function(drawingState) {
        tempDrawingState = drawingState;
        var gl=drawingState.gl;
        // create the shaders once - for all Garages
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["ground-vs", "ground-fs"]);
        }
        if (!buffers) {
            var gen = new Generate();
            var vposData = this.generateVPosData(drawingState);
            var vnormalData = gen.generateVNormalData(vposData);
            var textureCoords = this.generateTextureCoords(vposData);
            var arrays = {
                vpos : {numComponents:3, data:vposData},
                vnormal : {numComponents:3, data:vnormalData},
                textCoords : {numComponents:2, data:textureCoords}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }
        
    };

    World.prototype.generateTextureCoords = function (pos) {
        var a = [];
        for(var i = 0; i < pos.length; i += 9) {
            a.push(1.0);
            a.push(1.0);
            a.push(0.0);
            a.push(1.0);
            a.push(0.0);
            a.push(0.0);
        }
    }
    
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    World.prototype.adjustDepth = function (points) {
        this.findMaxYPoint(points);
        var YAdjustment = (MaxYPoint.point)/2.0;
        for(var i = 0; i < points.length; i++)
            for(var j = 0; j < points[0].length; j++)
                points[i][j].y -= YAdjustment;
        return points;
    }

    World.prototype.generateVPosData = function (drawingState) {
        grid = this.generate2DArray(this.width, this.depth);
        grid = this.adjustDepth(grid);
        grid = this.addFeatures(grid,drawingState);
        grid = this.generateWalls(grid);
        var points = this.grid2Points(grid);
        return points;
    }

    World.prototype.addFeatures = function (g, drawingState) {
        this.addBox();
        this.addRivers(1);
        this.addSky(drawingState);
        return grid;
    }

    World.prototype.addSky = function (drawingState) {
        //grobjects.push(new Sky(drawingState));        
        
        grobjects.push(new Sky(drawingState));        
    }

    World.prototype.addBox = function () {
        //grobjects.push(new Cube([0,grid[grid.length/2][grid.length/2].y,0],tempDrawingState));
    }

    World.prototype.addRivers = function (num) {
        for(var i = 0; i < num; i++) {
            this.addRiver(10,2);            
            grobjects.push(new River("River"+i,RiverBankLocations[i],[0.0,0.0,1.0],tempDrawingState));            
        }
    }

    World.prototype.addRiver = function (width,depth) {
        var locs = [];
        var i = 0;
        var j = Math.floor(Math.random() * 2*WorldSize)-width;
        // 0 = down, 1 = up, 2=left, 3=right
        var direction = 0;
        var turnedLastTime = false;
        if(j === 0)
            j = width;
        while(this.isInWorld(i,j) || this.isInWorld(i,j+width)) {
            var tempLocs = [];
            for(var w = 0; w < width; w++) {
                if(this.isInWorld(i,j+w)) {
                    grid[i][j+w].y -= depth;
                    var adjustment = 1;                            
                    if(j+w === 0) {
                    } 
                    tempLocs.push({
                        point:grid[i][j+w],
                        row:i,
                        column:j+w
                    });              
                }
            }
            if(tempLocs.length > 0) {
                var leftPoint = tempLocs[0];
                var rightPoint = tempLocs[tempLocs.length-1];
                var lcol = leftPoint.column;
                var rcol = rightPoint.column;
                var row = leftPoint.row;
                var end = grid.length - 1;
                var newRight;
                var newLeft;
                if(lcol > 0 && rcol < end) {
                    newRight = grid[row][lcol-1];
                    newLeft = grid[row][rcol+1]       
                }
                else if(lcol === 0 && rcol < end) {
                    newLeft = grid[row][lcol];
                    newLeft.y = grid[row][rcol+1].y;
                    newRight = grid[row][rcol+1]; 
                }      
                else {
                    newRight = grid[row][lcol];
                    newRight.y = grid[row][rcol-1].y;
                    newLeft = grid[row][lcol-1];  
                }
                newLeft.y -= 0.5;
                newRight.y -= 0.5;

                locs.push(newRight);
                locs.push(newLeft);
            }
            var turn = Math.random()*10;
            if(turn >= 3) {
                if(turn >= 5)
                    j++;
                else   
                    j--;
                turnedLastTime = true;
            }
            else
                turnedLastTime = false;
            i++;
        }
        RiverBankLocations.push(locs);
    }

    World.prototype.addPonds = function (g) {
        this.findMinYPoint(grid);
        var numberOfPonds = Math.floor(WorldSize/25 + Math.random()*2);
        for(var i = 0; i < numberOfPonds; i++) {
            var size = Math.floor(WorldSize/5 + Math.random()*(WorldSize/3));
            if(i === 0)
                this.addPond(5, 2, MinYPoint);
            else {
                // pick a point!!!!!
            }
        }
        return grid; 
    }


    World.prototype.addPond = function (size, depth, centerPoint) {
        grid[centerPoint.row][centerPoint.column].y -= (depth);
        PondLocations.push({
            centerRow:centerPoint.row,
            centerColumn:centerPoint.column,
            radius:depth
        });
        console.log("Center: " + centerPoint.row + "," + centerPoint.column);
        for(var currDepth = 1; currDepth <= size; currDepth++) {
            // Starting at the top left point
            var i = centerPoint.row - currDepth; 
            var j = centerPoint.column - currDepth;
            var moved = 0;
            // Top part
            for (var r = 0; r < 2*currDepth+1; r++) 
                if(this.isInWorld(i,j+r)) {
                    grid[i][j+r].y -= (depth-depth/currDepth);
                    var temp = j+r;
                    moved++;
                    console.log("(" + i + "," + temp + ")");
                }
            j += moved-1;
            moved = 0;
            // Right part
            for (var d = 1; d <= 2*currDepth; d++)
                if(this.isInWorld(i+d,j)) {
                    grid[i+d][j].y -= (depth-depth/currDepth);
                    var temp = i+d;
                    moved++;
                    console.log("(" + temp + "," + j + ")");
                }
            i += moved;
            moved = 0;
            // Bottom part
            for (var l = 1; l <= 2*currDepth; l++)
                if(this.isInWorld(i,j-l)) {
                    grid[i][j-l].y -= (depth-depth/currDepth);
                    var temp = j-l;
                    moved++;
                    console.log("(" + i + "," + temp + ")");
                }
            j -= moved;
            moved = 0;
            // Left part
            for (var u = 1; u < 2*currDepth; u++)
                if(this.isInWorld(i-u,j)) {
                    grid[i-u][j].y -= (depth-depth/currDepth);
                    var temp = i-u;
                    console.log("(" + temp + "," + j + ")");
                }                    
        }
    }

    World.prototype.isInWorld = function (i,j) {
        if(i < 0 || i >= grid.length)
            return false;
        if(j < 0 || j >= grid[0].length-1)
            return false;
        return true;
    }

    World.prototype.generateWalls = function (g) {
        this.findMinYPoint(g);
        var newGrid = new Array(g.length+2);
        var minY = MinYPoint.point;

        for(var i = 0; i < g[0].length+2; i++)
            newGrid[i] = new Array(g.length+2);

        for(var i = 0; i < g.length; i++)
            for(var j = 0; j < g.length; j++) {
                newGrid[i+1][j+1] = g[i][j];                
            }
        // Top Row
        for(var i = 1; i < newGrid[0].length - 1; i++) 
            newGrid[0][i] = {
                x:newGrid[1][i].x,
                y:minY - 1,
                z:newGrid[1][i].z
            };
        // Bottom Row
        for(var i = 1; i < newGrid[0].length - 1; i++)
            newGrid[newGrid.length-1][i] = {
                x:newGrid[newGrid.length-2][i].x,
                y:minY - 1,
                z:newGrid[newGrid.length-2][i].z
            };
        // Left Row
        for(var i = 1; i < newGrid.length - 1; i++) {
            newGrid[i][0] = {
                x:newGrid[i][1].x,
                y:minY - 1,
                z:newGrid[i][1].z
            };
        }
        // Right Row
        for(var i = 1; i < newGrid.length - 1; i++) {
            newGrid[i][newGrid.length-1] = {
                x:newGrid[i][newGrid.length-2].x,
                y:minY - 1,
                z:newGrid[i][newGrid.length-2].z
            }
        }
        // Corners
        newGrid[0][0] = newGrid[1][1];
        newGrid[0][newGrid.length-1] = newGrid[1][newGrid.length-2];
        newGrid[newGrid.length-1][0] = newGrid[newGrid.length-2][1];
        newGrid[newGrid.length-1][newGrid.length-1] = newGrid[newGrid.length-2][newGrid.length-2];
        this.bookKeeping();
        return newGrid;
    }

    World.prototype.bookKeeping = function () {
        // Changing the Max/Min points
        MinYPoint = {
            point:MinYPoint.point,
            row:MinYPoint.row+1,
            column:MinYPoint.column+1
        }
        MaxYPoint = {
            point:MaxYPoint.point,
            row:MaxYPoint.row+1,
            column:MaxYPoint.column+1
        }
        for(var i = 0; i < RiverBankLocations.length; i++)
            for(var j = 0; j < RiverBankLocations[i].length; j++) {
                RiverBankLocations[i][j].row++;
                RiverBankLocations[i][j].column++;
            }
    }

    World.prototype.grid2Points = function (g) {
        // grid must be at least 4x4
        var p = [];
        for(var i = 0; i < g.length - 1; i++)
            for(var j = 0; j < g[0].length - 1; j++) {
                p.addPoints([
                    g[i][j],
                    g[i+1][j],
                    g[i][j+1],
                    g[i+1][j],
                    g[i][j+1],
                    g[i+1][j+1],
                ]);
            }
        return p;
    }

    Array.prototype.addPoints = function (ps) {
        ps.forEach(function (p) {
            this.addPoint(p);
        }.bind(this))
    }

    Array.prototype.addPoint = function (p) {
        this.push(p.x);
        this.push(p.y);
        this.push(p.z);
    }

    World.prototype.stringify = function(grid) {
        var s = "";
        for(var i = 0; i < grid.length; i++) {
            for(var j = 0; j < grid[0].length; j++) {
                s += '(' + grid[i][j].x + ',' +  grid[i][j].y + ',' + grid[i][j].z + ')';
                if(j == grid.length - 1)
                    s += "\n";
                else
                    s += ",";
            }
        }
        return s;
    }

    World.prototype.generate2DArray = function (width, depth){
        // Bias in calculating the heigh to make rolling hills for additinalHeight
        var bias1 = 4.00;
        // Changes the random "step" up/down from the previous height
        var bias2 = 1.25;
        // Changes the odds of going negative (smaller has a higher odd of mountains/larger creates deeper vallys)
        var bias3 = 1.0025;
        // Changes the randomness in the random step up/down (so meta), dividing a randome 0-10
        var bias4 = 5.0;
        var a = [];
        for(var i = 0; i < width * 2; i++) {
            var t = [];
            for(var j = 0; j < depth * 2; j++) {
                var additionalHeight = 0;
                if(i !== 0 && i !== depth*2-1 && j !== 0 && j !== width*2-1) {
                    // only the diag to the left, left and above have been caclulated
                    var diagLeft = a[i-1][j-1].y;
                    var diagRight = a[i-1][j+1].y;
                    // because t is the next row to be added
                    var left = t[j-1].y;
                    var up = a[i-1][j].y;
                    additionalHeight = (diagLeft + diagRight + left + up)/bias1;
                }
                // to fix the "saddle shape occuring"
                if(i > width)
                    additionalHeight += 0.01;
                t.push({
                    x:-width + 0.5 + j,
                    y:additionalHeight + (Math.random() * 2 - bias3)/(bias2 + ((Math.random()*13.0)/bias4)),
                    z:-depth + 0.5 + i}
                );
            }
            a.push(t);
        }
        return a;
    }

    World.prototype.findMinYPoint = function (points) {
        var min = {
            point:points[0][0].y,
            row:0,
            col:0
        };
        for(var i = 0; i < points.length; i++)
            for(var j = 0; j < points[0].length; j++)
                if(points[i][j].y < min.point) {
                    var min = {
                        point:points[i][j].y,
                        row:i,
                        column:j
                    };
                }
        MinYPoint = min;
    }

    World.prototype.findMaxYPoint = function (points) {
        var max = {
            point:points[0][0].y,
            row:0,
            column:0
        };
        for(var i = 0; i < points.length; i++)
            for(var j = 0; j < points[0].length; j++)
                if(points[i][j].y > max.point) {
                    var max = {
                        point:points[i][j].y,
                        row:i,
                        column:j
                    };
                }
        MaxYPoint = max;
    }

    World.prototype.draw = function(drawingState) {
        // we make a model matrix to place the world in the world
        var modelM = twgl.m4.scaling([1.0,1.0,1.0]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.dayColor, model: modelM});
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    World.prototype.center = function(drawingState) {
        return this.position;
    }
})();
grobjects.push(new World (WorldSize,WorldSize,WorldSize));

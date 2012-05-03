$ ( document ).ready ( function ( ) {
	var snake = new Snake (
		{
		canvas: $ ( "#CanvasSnake" ) ,
		startPosx: 25 ,
		startPosy: 25 ,
		startDirection: "right" ,
		speed: 15 ,
		grid: 5 ,
		startFoodCount: 1 ,
		levelSteps: 15 ,
		startLength: 5 ,
		colorSnake: "#ff0000" ,
		colorFood: "#00ff00"
		} );
	snake.start ( );
} );

var Snake = function ( settings ) {
	
	this.graphic = settings.canvas.get ( 0 ).getContext ( "2d" );
	this.moveDirection = settings.startDirection;
	this.maxHeight = settings.canvas.height ( );
	this.maxWidth = settings.canvas.width ( );
	this.foodCount = settings.startFoodCount;
	this.levelsteps = settings.levelSteps;
	this.colorSnake = settings.colorSnake;
	this.colorFood = settings.colorFood;
	this.length = settings.startLength;
	this.pos = new Dot ( settings.startPosx, settings.startPosy, false );
	this.speed = settings.speed;
	this.grid = settings.grid;
	
	this.tail = new Array ( );
	this.food = new Array ( );
	this.intervalObj = null;
	this.keyPressed = false;
	this.pause = true;
	this.level = 1;
	
	this.start = function ( ) {
		thatSnake = this;
		
		$ ( document ).on (
			{
			"keydown": function ( event ) {
				if ( thatSnake.keyPressed || thatSnake.pause )
					return;
				
				thatSnake.keyPressed = true;
				// left: 37, up: 38, right: 39, down 40
				switch ( event.which ) {
					case 37 :
						if ( thatSnake.moveDirection != "left" && thatSnake.moveDirection != "right" )
							thatSnake.moveDirection = "left";
						break;
					case 38 :
						if ( thatSnake.moveDirection != "up" && thatSnake.moveDirection != "down" )
							thatSnake.moveDirection = "up";
						break;
					case 39 :
						if ( thatSnake.moveDirection != "left" && thatSnake.moveDirection != "right" )
							thatSnake.moveDirection = "right";
						break;
					case 40 :
						if ( thatSnake.moveDirection != "up" && thatSnake.moveDirection != "down" )
							thatSnake.moveDirection = "down";
						break;
					default :

						break;
				}
			} ,
			"keyup": function ( ) {
				if ( thatSnake.pause )
					return;
				thatSnake.keyPressed = false;
			}
			} );
		
		$ ( "#start" ).on ( "click" , function ( ) {
			if ( thatSnake.intervalObj == null )
				thatSnake.intervalObj = window.setInterval ( "thatSnake.move();" , 1000 / thatSnake.speed );
		} );
		
		$ ( "#stop_pause" ).on ( "click" , function ( ) {
			if ( thatSnake.intervalObj != null )
				window.clearInterval ( thatSnake.intervalObj );
		} );
		
		this.init ( );
		this.draw ( );
	};
	
	this.init = function ( ) {
		var dot = new Dot ( this.posx, this.posy );
		
		for ( var i = 1 ; i <= this.length ; i ++ ) {
			this.tail.push ( this.cloneDot ( dot ) );
			dot = this.moveDot ( dot );
		}
	};
	
	this.draw = function ( ) {
		for ( var index in this.tail ) {
			if ( this.tail [ index ].getDrawState ( ) )
				continue;
			
			this.drawDot ( this.tail [ index ] , this.colorSnake );
			this.tail [ index ].setDrawState ( true );
		}
	};
	
	this.drawDot = function ( dot , style ) {
		this.graphic.fillStyle = style;
		this.graphic.strokeStyle = style;
		this.graphic.fillRect ( dot.getx ( ) , dot.gety ( ) , this.grid , this.grid );
	};
	
	this.moveDot = function ( dot ) {
		if ( this.moveDirection == "left" )
			dot.setx ( dot.getx ( ) - this.grid );
		else if ( this.moveDirection == "up" )
			dot.sety ( dot.gety ( ) - this.grid );
		else if ( this.moveDirection == "right" )
			dot.setx ( dot.getx ( ) + this.grid );
		else if ( this.moveDirection == "down" )
			dot.sety ( dot.gety ( ) + this.grid );
		
		return dot;
	};
	
	this.isValidDot = function ( dot ) {
		for ( var index in this.tail.concat ( this.food ) )
			if ( dot.getx ( ) == this.tail [ index ].getx ( ) && dot.gety ( ) == this.tail [ index ].gety ( ) )
				return false;
		
	};
	
	this.cloneDot = function ( dot ) {
		return new Dot ( dot.getx ( ), dot.gety ( ), dot.getDrawState ( ) );
	};
	
	this.move = function ( ) {
		
	};
};

var Food = function ( pos , weight ) {
	this.weight = weight;
	this.pos = pos;
	
	this.getWeight = function ( ) {
		return this.weight;
	};
	
	this.getPos = function ( ) {
		return this.pos;
	};
};

var Dot = function ( x , y , drawState ) {
	this.drawState = drawState || false;
	this.x = x;
	this.y = y;
	
	this.getx = function ( ) {
		return this.x;
	};
	
	this.setx = function ( x ) {
		this.x = x;
	};
	
	this.gety = function ( ) {
		return this.y;
	};
	
	this.sety = function ( y ) {
		this.y = y;
	};
	
	this.getDrawState = function ( ) {
		return this.state;
	};
	
	this.setDrawState = function ( drawState ) {
		this.drawState = drawState;
	};
};

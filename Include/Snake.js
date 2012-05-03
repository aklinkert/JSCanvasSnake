$ ( document ).ready ( function ( ) {
	var s = new Snake (
		{
		canvas: $ ( "#CanvasSnake" ) ,
		startPosx: 25 ,
		startPosy: 25 ,
		startDirection: "right" ,
		speed: 15 ,
		grid: 10 ,
		startFoodCount: 1 ,
		levelStep: 1.5 ,
		startLength: 5 ,
		colorSnake: "#000000" ,
		colorFood: "#00ff00" ,
		colorSuperFood: "#FF0000" ,
		weightSuperFood: 3 ,
		weightFood: 1 ,
		elements:
			{
			"startButton": $ ( "#start" ) ,
			"pauseButton": $ ( "#pause" ) ,
			"resetButton": $ ( "#reset" ) ,
			"eatenFood": $ ( "#eatenFood" ) ,
			"levelOutput": $ ( "#level" ) ,
			"nextLevelOutput": $ ( "#nextLevel" )
			}
		} );
	s.init ( );
	s.start ( );
} );

var Snake = function ( settings ) {
	
	this.settings = settings;
	
	this.graphic = settings.canvas.get ( 0 ).getContext ( "2d" );
	this.weightSuperFood = settings.weightSuperFood;
	this.maxHeight = settings.canvas.height ( );
	this.maxWidth = settings.canvas.width ( );
	this.colorSnake = settings.colorSnake;
	this.weightFood = settings.weightFood;
	this.colorFood = settings.colorFood;
	this.levelStep = settings.levelStep;
	this.elements = settings.elements;
	this.speed = settings.speed;
	this.grid = settings.grid;
	this.moveDirection = null;
	this.intervalObj = null;
	this.foodCount = null;
	this.nextLevel = 0;
	this.length = null;
	this.failed = null;
	this.pause = null;
	this.level = null;
	this.tail = null;
	this.food = null;
	this.pos = null;
	
	this.init = function ( ) {
		thatSnake = this;
		
		settings.startPosx -= ( ( settings.startPosx % this.grid ) - 1 );
		if ( settings.startPosx < this.grid )
			settings.startPosx = this.grid * 2;
		if ( settings.startPosx > this.maxWidth - this.grid )
			settings.startPosx = this.maxWidth - this.grid * 2;
		
		settings.startPosy -= ( ( settings.startPosy % this.grid ) - 1 );
		if ( settings.startPosy < this.grid )
			settings.startPosy = this.grid * 2;
		if ( settings.startPosy > this.maxHeight - this.grid )
			settings.startPosy = this.maxHeight - this.grid * 2;
		
		$ ( document ).on ( "keydown" , function ( event ) {
			if ( thatSnake.pause )
				return;
			
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
		} );
		
		this.elements.startButton.on ( "click" , function ( ) {
			if ( thatSnake.intervalObj == null ) {
				thatSnake.pause = false;
				thatSnake.intervalObj = window.setInterval ( "thatSnake.move();" , 1000 / thatSnake.speed );
			}
		} );
		
		this.elements.resetButton.on ( "click" , function ( ) {
			if ( thatSnake.intervalObj == null && thatSnake.failed )
				thatSnake.start ( );
		} );
		
		this.elements.pauseButton.on ( "click" , function ( ) {
			if ( thatSnake.intervalObj != null ) {
				window.clearInterval ( thatSnake.intervalObj );
				thatSnake.intervalObj = null;
			}
			
		} );
	};
	
	this.start = function ( ) {
		
		this.pos = new Dot ( this.settings.startPosx, this.settings.startPosy, false );
		this.moveDirection = this.settings.startDirection;
		this.foodCount = this.settings.startFoodCount;
		this.length = this.settings.startLength;
		this.tail = new Array ( );
		this.food = new Array ( );
		this.intervalObj = null;
		this.failed = false;
		this.pause = true;
		this.level = 0;
		
		this.graphic.clearRect ( 0 , 0 , this.maxWidth , this.maxHeight );
		
		// Fill output fields with first values
		this.output ( );
		
		// Add |length| dots to tail
		this.tail.push ( this.cloneDot ( this.pos ) );
		for ( var i = 1 ; i < this.length ; i ++ ) {
			this.pos = this.moveDot ( this.pos );
			this.tail.push ( this.cloneDot ( this.pos ) );
		}
		
		// add new Foods
		this.addFoods ( );
		
		// Draw Snake
		this.draw ( );
		
		this.setLevel ( );
	};
	
	this.draw = function ( ) {
		for ( var index in this.tail ) {
			if ( this.tail [ index ].getDrawState ( ) )
				continue;
			
			this.drawDot ( this.tail [ index ] , this.colorSnake );
			this.tail [ index ].setDrawState ( true );
		}
	};
	
	this.move = function ( ) {
		this.pos = this.moveDot ( this.pos );
		
		if ( this.isFoodDot ( this.pos ) ) {
			this.removeFood ( this.pos );
			this.removeDot ( this.pos );
			this.length ++ ;
			this.setLevel ( );
			this.addFoods ( );
		}
		else if ( this.isTailDot ( this.pos ) ) {
			this.failed = true;
			this.elements.pauseButton.trigger ( "click" );
			alert ( "Failed at Tail" );
			return;
		}
		else if ( this.isBorderDot ( this.pos ) ) {
			this.failed = true;
			this.elements.pauseButton.trigger ( "click" );
			alert ( "Failed at Border" );
			return;
		}
		else {
			var lastDot = this.tail.shift ( );
			this.removeDot ( lastDot );
		}
		
		this.tail.push ( this.cloneDot ( this.pos ) );
		this.drawDot ( this.pos );
	};
	
	// DOT OPERATIONS
	
	this.drawDot = function ( dot , style ) {
		this.graphic.fillStyle = style;
		this.graphic.strokeStyle = style;
		this.graphic.fillRect ( dot.getx ( ) , dot.gety ( ) , this.grid , this.grid );
	};
	
	this.cloneDot = function ( dot ) {
		return new Dot ( dot.getx ( ), dot.gety ( ), dot.getDrawState ( ) );
	};
	
	this.removeDot = function ( dot ) {
		this.graphic.clearRect ( dot.getx ( ) , dot.gety ( ) , this.grid , this.grid );
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
	
	this.isValidDot = function ( dot , secure ) {
		return ( ! ( this.isTailDot ( dot ) || this.isFoodDot ( dot ) || ( ( typeof secure != "undefined" && secure == true ) ? this.isNearBorderDot ( dot ) : false ) ) );
	};
	
	this.isTailDot = function ( dot ) {
		for ( var index in this.tail )
			if ( dot.getx ( ) == this.tail [ index ].getx ( ) && dot.gety ( ) == this.tail [ index ].gety ( ) )
				return true;
		return false;
	};
	
	this.isFoodDot = function ( dot ) {
		for ( var index in this.food )
			if ( dot.getx ( ) == this.food [ index ].getPos ( ).getx ( ) && dot.gety ( ) == this.food [ index ].getPos ( ).gety ( ) )
				return true;
		return false;
	};
	
	this.isBorderDot = function ( dot ) {
		return ( dot.getx ( ) <= 0 || dot.getx ( ) >= this.maxWidth || dot.gety ( ) <= 0 || dot.gety ( ) >= this.maxHeight );
	};
	
	this.isNearBorderDot = function ( dot ) {
		return ( dot.getx ( ) < this.grid || ( dot.getx ( ) >= ( this.maxWidth - this.grid ) ) || dot.gety ( ) < this.grid || ( dot.gety ( ) >= ( this.maxHeight - this.grid ) ) );
	};
	
	// FOOD OPERATIONS
	
	this.newFood = function ( weight ) {
		var dot = new Dot ( Math.round ( Math.random ( ) * this.maxWidth ), Math.round ( Math.random ( ) * this.maxHeight , false ) );
		dot.setx ( dot.getx ( ) - ( ( dot.getx ( ) % this.grid ) - 1 ) );
		dot.sety ( dot.gety ( ) - ( ( dot.gety ( ) % this.grid ) - 1 ) );
		
		return ( this.isValidDot ( dot , true ) ) ? new Food ( dot, weight ) : this.newFood ( );
	};
	
	this.addFoods = function ( ) {
		while ( this.food.length < this.foodCount ) {
			var rand = Math.random ( );
			
			if ( rand < 0.15 ) { // SuperFood
				var food = this.newFood ( this.weightSuperFood );
				this.food.push ( food );
				this.drawDot ( food.getPos ( ) , this.colorSuperFood );
			}
			else {
				var food = this.newFood ( this.weightFood );
				this.food.push ( food );
				this.drawDot ( food.getPos ( ) , this.colorFood );
			}
			
		}
	};
	
	this.removeFood = function ( dot ) {
		if ( dot instanceof Food )
			dot = dot.getPos ( );
		
		for ( var index in this.food )
			if ( dot.getx ( ) == this.food [ index ].getPos ( ).getx ( ) && dot.gety ( ) == this.food [ index ].getPos ( ).gety ( ) )
				return this.food.splice ( index , 1 );
	};
	
	// LEVEL OPERATIONS
	
	this.setLevel = function ( ) {
		if ( this.length >= this.nextLevel ) {
			this.level ++ ;
			this.nextLevel = this.level + Math.round ( this.length * this.levelStep );
			this.foodCount = Math.round ( this.level / 2 );
		}
		
		this.output ( );
	};
	
	// OUTPUT OPERATIONS
	
	this.output = function ( ) {
		this.elements.eatenFood.text ( this.length );
		this.elements.levelOutput.text ( this.level );
		this.elements.nextLevelOutput.text ( this.nextLevel );
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

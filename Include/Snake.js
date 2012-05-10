$ ( document ).ready ( function ( ) {
	var s = new Snake (
		{
		canvas: $ ( "#CanvasSnake" ) ,
		startPosx: 25 ,
		startPosy: 25 ,
		startDirection: "right" ,
		speed: 15 ,
		grid: 10 ,
		levelStep: 1.5 ,
		startLength: 5 ,
		colorSnake: "#000000" ,
		food:
			{
			"default":
				{
				"color": "#888888" ,
				"weight": 1 ,
				"default": true
				} ,
			"bigfood":
				{
				"color": "#0000FF" ,
				"weight": 3 ,
				"percentage": 10
				} ,
			"slowMotionFood":
				{
				"color": "#00FF00" ,
				"weight": 0 ,
				"percentage": 5
				} ,
			"speedFood":
				{
				"color": "#FF0000" ,
				"weight": 0 ,
				"percentage": 5
				}
			} ,
		throughWalls: true ,
		elements:
			{
			length: $ ( "#length" ) ,
			startButton: $ ( "#start" ) ,
			pauseButton: $ ( "#pause" ) ,
			resetButton: $ ( "#reset" ) ,
			levelOutput: $ ( "#level" ) ,
			wallsOption: $ ( "#throughWalls" ) ,
			nextLevelOutput: $ ( "#nextLevel" ) ,
			increaseSpeedLevel: $ ( "#increaseSpeedLevel" )
			}
		} );
	s.init ( );
	s.start ( );
} );

var Snake = function ( settings ) {
	
	this.settings = settings;
	
	this.graphic = settings.canvas.get ( 0 ).getContext ( "2d" );
	this.maxHeight = settings.canvas.height ( );
	this.maxWidth = settings.canvas.width ( );
	this.colorSnake = settings.colorSnake;
	this.levelStep = settings.levelStep;
	this.elements = settings.elements;
	this.changedDirection = null;
	this.grid = settings.grid;
	this.moveDirection = null;
	this.foodTypes = settings.food;
	this.intervalObj = null;
	this.foodCount = null;
	this.nextLevel = 0;
	this.length = null;
	this.failed = null;
	this.pause = null;
	this.level = null;
	this.speed = null;
	this.tail = null;
	this.food = null;
	this.pos = null;
	
	this.init = function ( ) {
		thatSnake = this;
		
		this.settings.startPosx -= ( ( this.settings.startPosx % this.grid ) - 1 );
		if ( this.settings.startPosx < this.grid )
			this.settings.startPosx = this.grid * 2;
		if ( this.settings.startPosx > this.maxWidth - this.grid )
			this.settings.startPosx = this.maxWidth - this.grid * 2;
		
		this.settings.startPosy -= ( ( this.settings.startPosy % this.grid ) - 1 );
		if ( this.settings.startPosy < this.grid )
			this.settings.startPosy = this.grid * 2;
		if ( this.settings.startPosy > this.maxHeight - this.grid )
			this.settings.startPosy = this.maxHeight - this.grid * 2;
		
		$ ( document ).on ( "keydown" , function ( event ) {
			if ( thatSnake.pause || thatSnake.changedDirection )
				return;
			
			// left: 37, up: 38, right: 39, down 40
			switch ( event.which ) {
				case 37 :
					if ( thatSnake.moveDirection != "left" && thatSnake.moveDirection != "right" ) {
						thatSnake.moveDirection = "left";
						thatSnake.changedDirection = true;
					}
					break;
				case 38 :
					if ( thatSnake.moveDirection != "up" && thatSnake.moveDirection != "down" ) {
						thatSnake.moveDirection = "up";
						thatSnake.changedDirection = true;
					}
					break;
				case 39 :
					if ( thatSnake.moveDirection != "left" && thatSnake.moveDirection != "right" ) {
						thatSnake.moveDirection = "right";
						thatSnake.changedDirection = true;
					}
					break;
				case 40 :
					if ( thatSnake.moveDirection != "up" && thatSnake.moveDirection != "down" ) {
						thatSnake.moveDirection = "down";
						thatSnake.changedDirection = true;
					}
					break;
				default :

					break;
			}
		} );
		
		$ ( this.elements.startButton ).on ( "click" , function ( ) {
			if ( thatSnake.intervalObj == null && ! thatSnake.failed ) {
				thatSnake.pause = false;
				thatSnake.intervalObj = window.setInterval ( "thatSnake.move();" , 1000 / thatSnake.speed );
			}
		} );
		
		$ ( this.elements.resetButton ).on ( "click" , function ( ) {
			if ( thatSnake.intervalObj == null && thatSnake.failed )
				thatSnake.start ( );
		} );
		
		$ ( this.elements.pauseButton ).on ( "click" , function ( ) {
			if ( thatSnake.intervalObj != null ) {
				window.clearInterval ( thatSnake.intervalObj );
				thatSnake.intervalObj = null;
			}
			
		} );
		
		var percent = 0;
		for ( var index in this.foodTypes )
			if ( typeof this.foodTypes [ index ].percentage != "undefined" )
				this.foodTypes [ index ].percentage = percent = this.foodTypes [ index ].percentage + percent;
		
		if ( typeof this.foodTypes [ "default" ] == "undefined" )
			this.foodTypes [ "default" ] = this.foodTypes [ 0 ];
	};
	
	this.start = function ( ) {
		
		this.pos = new Dot ( this.settings.startPosx, this.settings.startPosy );
		this.moveDirection = this.settings.startDirection;
		this.length = this.settings.startLength;
		this.changedDirection = false;
		this.speed = settings.speed;
		this.tail = new Array ( );
		this.food = new Array ( );
		this.intervalObj = null;
		this.failed = false;
		this.nextLevel = 0;
		this.foodCount = 0;
		this.pause = true;
		this.level = 0;
		
		this.setLevel ( );
		
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
	};
	
	this.draw = function ( ) {
		for ( var index in this.tail )
			this.drawDot ( this.tail [ index ] , this.colorSnake );
	};
	
	this.move = function ( ) {
		this.pos = this.moveDot ( this.pos );
		this.changedDirection = false;
		
		if ( this.isFoodDot ( this.pos ) ) {
			var food = this.removeFood ( this.pos );
			this.removeDot ( this.pos );
			this.length += food.getWeight ( );
			this.setLevel ( );
			this.addFoods ( );
		} else if ( this.isBorderDot ( this.pos ) ) {
			if ( this.settings.elements.wallsOption.is ( ":checked" ) ) {
				if ( this.pos.getx ( ) <= 0 ) {
					this.pos.setx ( this.pos.getx ( ) + this.maxWidth );
				} else if ( this.pos.getx ( ) >= this.maxWidth ) {
					this.pos.setx ( this.pos.getx ( ) - this.maxWidth );
				} else if ( this.pos.gety ( ) <= 0 ) {
					this.pos.sety ( this.pos.gety ( ) + this.maxHeight );
				} else if ( this.pos.gety ( ) >= this.maxHeight ) {
					this.pos.sety ( this.pos.gety ( ) - this.maxHeight );
				}
				
				this.removeDot ( this.tail.shift ( ) );
			} else {
				this.failed = true;
				$ ( this.elements.pauseButton ).trigger ( "click" );
				alert ( "Failed at Border" );
				return;
			}
		} else if ( this.isTailDot ( this.pos ) ) {
			this.failed = true;
			$ ( this.elements.pauseButton ).trigger ( "click" );
			alert ( "You failed!" );
			return;
		} else {
			if ( this.length <= this.tail.length )
				this.removeDot ( this.tail.shift ( ) );
		}
		
		this.tail.push ( this.cloneDot ( this.pos ) );
		this.drawDot ( this.pos , this.colorSnake );
	};
	
	// DOT OPERATIONS
	
	this.drawDot = function ( dot , style ) {
		this.graphic.fillStyle = style;
		this.graphic.strokeStyle = style;
		this.graphic.fillRect ( dot.getx ( ) , dot.gety ( ) , this.grid , this.grid );
	};
	
	this.cloneDot = function ( dot ) {
		return new Dot ( dot.getx ( ), dot.gety ( ) );
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
		var dot = new Dot ( Math.round ( Math.random ( ) * this.maxWidth ), Math.round ( Math.random ( ) * this.maxHeight ) );
		dot.setx ( dot.getx ( ) - ( ( dot.getx ( ) % this.grid ) - 1 ) );
		dot.sety ( dot.gety ( ) - ( ( dot.gety ( ) % this.grid ) - 1 ) );
		
		return ( this.isValidDot ( dot , true ) ) ? new Food ( dot, weight ) : this.newFood ( weight );
	};
	
	this.addFoods = function ( ) {
		while ( this.food.length < this.foodCount ) {
			var rand = ( Math.random ( ) ) * 100;
			var f = null;
			for ( var index in this.foodTypes ) {
				f = this.foodTypes [ index ];
				
				if ( ( typeof f.percentage != "undefined" ) && ( rand <= f.percentage ) ) {
					console.debug ( "rand: " + rand + "; food: " + index + "; percentage: " + f.percentage + "; weight: " + f.weight );
					var food = this.newFood ( f.weight );
					this.food.push ( food );
					this.drawDot ( food.getPos ( ) , f.color );
					
					if ( typeof f.effekt != "undefined" ) {
						// TODO implement effekts
					}
					
					break;
				}
				
				f = null;
			}
			
			if ( f == null ) {
				f = this.foodTypes [ "default" ];
				console.debug ( "rand: " + rand + "; food: default; weight: " + f.weight );
				var food = this.newFood ( f.weight );
				this.food.push ( food );
				this.drawDot ( food.getPos ( ) , f.color );
				break;
			}
		}
	};
	
	this.removeFood = function ( dot ) {
		if ( dot instanceof Food )
			dot = dot.getPos ( );
		
		for ( var index in this.food ) {
			if ( dot.getx ( ) == this.food [ index ].getPos ( ).getx ( ) && dot.gety ( ) == this.food [ index ].getPos ( ).gety ( ) ) {
				var food = this.food [ index ];
				this.food.splice ( index , 1 );
				return food;
			}
		}
	};
	
	// LEVEL OPERATIONS
	
	this.setLevel = function ( ) {
		if ( this.length >= this.nextLevel ) {
			this.level ++ ;
			this.nextLevel = this.level + Math.round ( this.length * this.levelStep );
			this.foodCount = Math.round ( this.level / 2 );
			
			if ( this.settings.elements.increaseSpeedLevel.is ( ":checked" ) ) {
				this.speed *= 1.2;
				if ( ! this.pause ) {
					$ ( this.elements.pauseButton ).trigger ( "click" );
					$ ( this.elements.startButton ).trigger ( "click" );
				}
			}
		}
		
		this.output ( );
	};
	
	// OUTPUT OPERATIONS
	
	this.output = function ( ) {
		$ ( this.elements.length ).text ( this.length );
		$ ( this.elements.levelOutput ).text ( this.level );
		$ ( this.elements.nextLevelOutput ).text ( this.nextLevel );
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

var Dot = function ( x , y ) {
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
};

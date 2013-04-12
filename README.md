# ![test](http://imageshack.us/a/img825/520/bugkfp.png) xdebugJS


JavaScript component for better xdebug integration based on micro-framework [snackJS](https://github.com/rpflorence/snack) written by Ryan Florence.

## General
xdebugJS integrates the well known php module **xdebug** in your development environment. The main goal of xdebugJS is
the prevention of unvisible **var_dump()** or **traces** and broken HTML.

You will be able to view each xdebug output seperated from the base HTML. So you can analyse big dumps and 
very long traces.

## How it works
xdebugJS is really very simple and not very smart (performance issues). But i will fix this later!

### What it does
xdebugjs attaches a listener to the rarely used event signal **DOMNodeInserted**. You can guess when it will be fired!
When ever a new DOM node is inserted to the **document** xdebugJS will walk through a predefined set of css selectors:

    traceSelector: [
            /* Notice */
            'table.xe-notice',
            /* Fatal */
            'table.xe-fatal-error',
            /* Warning */
            'table.xe-warning',
            /* Exception */
            'table.xe-exception',
            /* uncaught Exception */
            'table.xe-uncaught-exception',
            /* BackTrace */
            'table.xe-xdebug',
            /* Parse Error */
            'table.xe-parse-error',
        ],
        dumpSelector: [
            /* Dump */
            "pre.xdebug-var-dump"
        ]

Matched elements will be cloned and simply added to our console. That's it's!
At this moment notifications are handled by native JavaScript alerts?! I think that is not the best way. But you can easily overwrite the **notificator** method...

    /* Initilize it! */
    xDebugInstance.init({
        /* Options goes here! */    
        notificator: function (p_totalEntries) {
            /* custom code */
        }
    });

## Why snackJS
Okay, it is not popular like prototype or JQuery but it is damn small. snackJS has all basic functionalities you need for small projects like this and you can prevent problems by using prototype or JQuery in the opposite environment. So it does not matter which Framework you are using.

## Documentation
TODO

## Install

First include the necessary ressources in the **head** of your site...

    <link rel="stylesheet" href="css/xdebugJS.css" />
    <script type="text/javascript" src="js/snack-sizzle-min.js"></script>
    <script type="text/javascript" src="js/xdebugJS.js"></script>

and configure/initialize xdebugJS...

	<script type="text/javascript">
		/* Wait until DOM is ready */
		snack.ready(function() {
			/* Create a new xdebugJS instance */
	    	var xDebugInstance = Object.create(xDebugJS);

	    	/* Initilize it! */
	    	xDebugInstance.init({
	    		/* Options goes here! */	
    		});
		});
	</script>
  
Now we have to add some HTML to our site. You should place this at the top (Fatal Errors?!)...

    <!--  xdebugJS MainContainer -->
    <div id="xdebugMainContainer">
        <!--  Open/Close console -->
        <a href="javascript:void(0)" class="xdebugOpener"><img src="css/bug.png" /></a>
        <div id="xdebugContainer" style="display:none">
            <!--  Controls to walk through the entries -->
            <div id="xdebugControl">
                <a href="javascript:void(0)" class="xdebugControl prev"><img src="css/left.png" /></a>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span class="xdebugLabelCurrent"></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span class="xdebugLabelTotal"></span>
                <a href="javascript:void(0)" class="xdebugControl next"><img src="css/right.png" /></a>
            </div>
            <!--  xdebug dump/trace container -->
            <div id="xdebugContent"></div>
        </div>
    </div>
    
For testing purpose we should generate now some xdebug output and see the reaction...

    <?php
      var_dump($_SERVER);
      var_dump($_REQUEST);
      xdebug_print_function_stack();
    ?>

## Copyright
Copyright (c) Selcuk Kekec
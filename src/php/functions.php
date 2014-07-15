<?php
	//Generates an array of colors for a colorramp and a number of features
	function getColors($startColor, $endColor, $count) {
		$resultArray = array();

		$c1 = $startColor; // start color
		$c2 = $endColor; // end color
		$nc = $count; // Number of colors to display.
		$dc = array(($c2[0]-$c1[0])/($nc-1),($c2[1]-$c1[1])/($nc-1),($c2[2]-$c1[2])/($nc-1)); // Step between colors

		for ($i=0;$i<$nc;$i++){
			$newColor = array(round($c1[0]+$dc[0]*$i),round($c1[1]+$dc[1]*$i),round($c1[2]+$dc[2]*$i));
		    array_push($resultArray, $newColor);
		}

		return $resultArray;	
	}

	//Convert hex color code to rgb
	function hex2rgb($hex) {
		$hex = str_replace("#", "", $hex);

		if(strlen($hex) == 3) {
	   		$r = hexdec(substr($hex,0,1).substr($hex,0,1));
	      	$g = hexdec(substr($hex,1,1).substr($hex,1,1));
	      	$b = hexdec(substr($hex,2,1).substr($hex,2,1));
	   	} else {
	    	$r = hexdec(substr($hex,0,2));
	      	$g = hexdec(substr($hex,2,2));
	      	$b = hexdec(substr($hex,4,2));
	      	$a = hexdec(substr($hex,6,2));
	   	}
	   	$rgb = array($r, $g, $b, $a);
	   
	   	return $rgb; // returns an array with the rgb values
	}

	//Convert rgb to hex
	function rgb2hex($rgb) {
		$hex = "#";
		$hex .= str_pad(dechex($rgb[0]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[1]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[2]), 2, "0", STR_PAD_LEFT);

		//alpha
	   	if (isset($rgb[3])) {
	   		$hex .= str_pad(dechex(floor($rgb[3])), 2, "0", STR_PAD_LEFT);	
	   	}

	   	return $hex; // returns the hex value including the number sign (#)
	}
?>
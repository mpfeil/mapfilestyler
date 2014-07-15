<?php 

	//generates equal interval symbols
	function equalInterval($data, $classes) {

		$min = min($data);
		$max = max($data);
		$range = ($max - $min) / $classes;
		$resultArray = array();

		array_push($resultArray, $min);
		for ($i=0; $i < $classes; $i++) { 
			$test = $resultArray[$i]+$range;
			array_push($resultArray, $test);
		}
		
		return $resultArray;
	}

	function jenks($data, $n_classes) {

		// Compute the matrices required for Jenks breaks. These matrices
    	// can be used for any classing of data with `classes <= n_classes`
		function getMatrices($data,$n_classes) {

			// in the original implementation, these matrices are referred to
	        // as `LC` and `OP`
	        //
	        // * lower_class_limits (LC): optimal lower class limits
	        // * variance_combinations (OP): optimal variance combinations for all classes
			$lower_class_limits = array();
			$variance_combinations = array();
			// loop counters
			$i;
			$j;
			// the variance, as computed at each step in the calculation
			$variance = 0;

			// Initialize and fill each matrix with zeroes
			for ($i=0; $i < count($data)+1; $i++) { 
				$tmp1 = array();
				$tmp2 = array();
				for ($j=0; $j < $n_classes + 1; $j++) { 
					array_push($tmp1, 0);
					array_push($tmp2, 0);
				}
				array_push($lower_class_limits, $tmp1);
				array_push($variance_combinations, $tmp2);
			}

			for ($i=1; $i < $n_classes + 1; $i++) { 
				$lower_class_limits[1][$i] = 1;
				$variance_combinations[1][$i] = 0;
				for ($j=2; $j < count($data)+1; $j++) { 
					$variance_combinations[$j][$i] = 9999999;
				}
			}

			for ($l=2; $l < count($data)+1 ; $l++) {
				$sum = 0;
				$sum_squares = 0;
				$w = 0;
				$i4 = 0;

				for ($m=1; $m <  $l + 1; $m++) {
					
					$lower_class_limit = $l - $m + 1;

					$val = $data[$lower_class_limit - 1];
					
					$w++;
					
					$sum += $val;
					$sum_squares += $val * $val;
	
					$variance = $sum_squares - ($sum * $sum) / $w;
				
					$i4 = $lower_class_limit - 1;
			
					if ($i4 !== 0) {
						for ($j=2; $j < $n_classes + 1; $j++) {
							if ($variance_combinations[$l][$j] >= ($variance + $variance_combinations[$i4][$j-1])) {
								$lower_class_limits[$l][$j] = $lower_class_limit;
								$variance_combinations[$l][$j] = $variance + $variance_combinations[$i4][$j-1];
							}
						}
					}
				}
				
				$lower_class_limits[$l][1] = 1;
            	$variance_combinations[$l][1] = $variance;
			}

			return array(
				"lower_class_limits"=>$lower_class_limits,
				"variance_combinations"=>$variance_combinations
			);
		}

		function breaks($data, $lower_class_limits, $n_classes) {
			$k = count($data) - 1;
			$kclass = array();
			$countNum = $n_classes;

			// the calculation of classes will never include the upper and
	        // lower bounds, so we need to explicitly set them
	        $kclass[$n_classes] = $data[count($data)-1];
	        $kclass[0] = $data[0];

	        // the lower_class_limits matrix is used as indexes into itself
        	// here: the `k` variable is reused in each iteration.
	        while ($countNum > 1) {
	        	$kclass[$countNum-1] = $data[$lower_class_limits[$k][$countNum]-2];
	        	$k = $lower_class_limits[$k][$countNum]-1;
	        	$countNum--;
	        }
	 
	        return $kclass;
		}

		if ($n_classes > count($data)) {
			return null;
		}

		//sort data in numerical order, expected by matrices function 
		sort($data);

		// get our basic matrices
    	$matrices = getMatrices($data, $n_classes);

        // we only need lower class limits here
        $lower_class_limits = $matrices["lower_class_limits"];
        $breaks = breaks($data, $lower_class_limits, $n_classes);
        ksort($breaks);
    	return $breaks;
	}

	function quantile($data, $classes) {
		sort($data);
		$n = count($data);
		$breaks = array();

		foreach(range(0,$classes-1) as $i) {
			$q = $i / (float)$classes;
			$a = $q * $n;
			$aa = (int)$q * $n;
			$r = $a - $aa;
			$Xq = (1 - $r) * $data[$aa] + $r * $data[$aa+1];
			array_push($breaks, $Xq);
		}
		array_push($breaks, $data[$n-1]);

		return $breaks;
	}

	function standardDeviation($data,$classes) {
		$mean = 0.0;
		$sd2 = 0.0;
		$n = count($data);
		$min = min($data);
		$max = max($data);
		for ($i=0; $i < $n; $i++) { 
			$mean = $mean + $data[$i];
		}
		$mean = $mean / $n;
		for ($i=0; $i < $n; $i++) {
			$sd = $data[$i] - $mean;
			$sd2 += $sd * $sd;
		}
		$sd2 = sqrt($sd2 / $n);
		$res = rpretty(($min-$mean)/$sd2, ($max-$mean)/$sd2, $classes);
		$res2 = array();
		foreach ($res as $val) {
			$tempVal = ($val*$sd2)+$mean;
			array_push($res2, $tempVal);
		}
		return $res2;
	}

	function rpretty($dmin, $dmax, $n) {
		$resultArray = array();
		$min_n = (int)($n / 3);
		$shrink_sml = 0.75;
		$high_u_bias = 1.5;
		$u5_bias = 0.5 + 1.5 * $high_u_bias;
		$h = $high_u_bias;
		$h5 = $u5_bias;
		$ndiv = $n;

		$dx = $dmax - $dmin;
		if ($dx == 0 && $dmax == 0) {
			$cell = 1.0;
			$i_small = True;
			$U = 1;
		} else {
			$cell = max(abs($dmin),abs($dmax));
			if ($h5 >= 1.5 * $h + 0.5) {
				$U = 1 + (1.0/(1+$h));
			} else {
				$U = 1 + (1.5 / (1 + $h5));
    			$i_small = $dx < ($cell * $U * max(1.0, $ndiv) * 1e-07 * 3.0);
			}
		}

		if ($i_small) {
			if ($cell > 10) {
				$cell = 9 + $cell / 10;
      			$cell = $cell * $shrink_sml;	
			}
			if ($min_n > 1) {
				$cell = $cell / $min_n;
			}
		} else {
			$cell = $dx;
			if ($ndiv > 1) {
				$cell = $cell / $ndiv;
			}
		}

		if ($cell < 20 * 1e-07) {
			$cell = 20 * 1e-07;
		}

		$base = pow(10.0, floor(log10($cell))); 
		$unit = $base;
		if ((2 * $base) - $cell < $h * ($cell - $unit)) {
			$unit = 2.0 * $base;
			if ((5 * $base) - $cell < $h5 * ($cell - $unit)) {
				$unit = 5.0 * $base;
				if ((10 * $base) - $cell < $h * ($cell - $unit)) {
					$unit = 10.0 * $base;
				}
			}
		}

		$ns = floor($dmin / $unit + 1e-07);
		$nu = ceil($dmax / $unit - 1e-07);

		while ($ns * $unit > $dmin + (1e-07 * $unit)) {
			$ns = $ns - 1;
		}
		while ($nu * $unit < $dmax - (1e-07 * $unit)) {
			$nu = $nu + 1;
		}

		$k = floor(0.5 + $nu-$ns);
		if ($k < $min_n) {
			$k = $min_n - $k;
			if ($ns >= 0) {
				$nu = $nu + $k / 2;
				$ns = $ns - $k / 2 + $k % 2;
			} else {
				$ns = $ns - $k / 2;
		      	$nu = $nu + $k / 2 + $k % 2	;
			}
		} else {
			$ndiv = $k;
		}

		$graphmin = $ns * $unit;
		$graphmax = $nu * $unit;

		$count = (int)(ceil($graphmax - $graphmin))/$unit;
		foreach(range(0,$count) as $i) {
			$tempVal = $graphmin + $i * $unit;
			array_push($resultArray, $tempVal);
		}

		if ($resultArray[0] < $dmin) {
			$resultArray[0] = $dmin;
		}
		if ($resultArray[count($resultArray)-1] > $dmax) {
			$resultArray[count($resultArray)-1] = $dmax;
		}
		return $resultArray;
	}

	function pretty($data,$classes) {
		$min = min($data);
		$max = max($data);
		
		return rpretty($min,$max,$classes);	
	}

?>
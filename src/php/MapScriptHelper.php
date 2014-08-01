<?php
	require_once('statistics.php');
	require_once('functions.php');

	if (isset($_GET["function"])) {
		if ($_GET["function"] == "getLayers") {
			echo getLayers($_GET["mapFile"]);
		} else if ($_GET["function"] == "getLayerAttributes") {
			echo getLayerAttributes($_GET["dataSource"],$_GET["layerName"],$_GET["onlyContinuesAttributes"]);
		} else if ($_GET["function"] == "getClassesForLayer") {
			echo getClassesForLayer($_GET["mapFile"],$_GET["layerName"]);
		} else if ($_GET["function"] == "getStylesForClass") {
			echo getStylesForClass($_GET["mapFile"],$_GET["layerName"],$_GET["classIndex"]);
		} else if ($_GET["function"] == "getStylesForClasses") {
			echo getStylesForClasses($_GET["mapFile"],$_GET["layerName"]);
		} else if ($_GET["function"] == "getSymbols") {
			echo getSymbols($_GET["mapFile"]);
		}
	}

	if (isset($_POST["function"])) {
		if ($_POST["function"] == "applyNewClassification") {
			$mapFile = $_POST["mapFile"];
			$layerName = $_POST["layerName"];
			$attribute = $_POST["attribute"];
			$type = $_POST["type"];
			$method = $_POST["method"];
			$classes = $_POST["classes"];
			$startColor = $_POST["startColor"];
			$endColor = $_POST["endColor"];

			$map = new mapObj($mapFile);
			$layer = $map->getLayerByName($layerName);

			if (!isset($startColor)) {
				$startColor = "#FFFFFF";
			}
			if (!isset($endColor)) {
				$endColor = "#FFFFFF";
			}

			if ($type == "ss") {
				$colors = array(hex2rgb($startColor));
				$breaks = array('Single Symbol');
				saveToMapFile($map,$layer,$attribute,$type,$breaks,$colors,$mapFile);
			} else if($type == "cs") {
				$featuresInLayer = getNumOfFeatures($map,$layer,$attribute);
				$colors = getColors(hex2rgb($startColor),hex2rgb($endColor),count($featuresInLayer));
				saveToMapFile($map,$layer,$attribute,$type,$featuresInLayer,$colors,$mapFile);
			} else if($type == "gs") {
				if ($method == "ei") {
					$data = getNumOfFeatures($map,$layer,$attribute);
					$breaks = equalInterval($data,$classes);
					$colors = getColors(hex2rgb($startColor),hex2rgb($endColor),count($breaks));
					saveToMapFile($map,$layer,$attribute,$type,$breaks,$colors,$mapFile);
				} else if ($method == "nb") {
					$data = getNumOfFeatures($map,$layer,$attribute);
					$breaks = jenks($data,$classes);
					$colors = getColors(hex2rgb($startColor),hex2rgb($endColor),count($breaks));
					saveToMapFile($map,$layer,$attribute,$type,$breaks,$colors,$mapFile);
				} else if ($method == "quec") {
					$data = getNumOfFeatures($map,$layer,$attribute);
					$breaks = quantile($data,$classes);
					$colors = getColors(hex2rgb($startColor),hex2rgb($endColor),count($breaks));
					saveToMapFile($map,$layer,$attribute,$type,$breaks,$colors,$mapFile);
				} else if ($method == "sd") {
					$data = getNumOfFeatures($map,$layer,$attribute);
					$breaks = standardDeviation($data,$classes);
					$colors = getColors(hex2rgb($startColor),hex2rgb($endColor),count($breaks));
					saveToMapFile($map,$layer,$attribute,$type,$breaks,$colors,$mapFile);
				} else if ($method == "pb") {
					$data = getNumOfFeatures($map,$layer,$attribute);
					$breaks = pretty($data,$classes);
					$colors = getColors(hex2rgb($startColor),hex2rgb($endColor),count($breaks));
					saveToMapFile($map,$layer,$attribute,$type,$breaks,$colors,$mapFile);
				}
			}
		} else if ($_POST["function"] == "updateStyles") {
			$mapFile = $_POST["mapFile"];
			$layerName = $_POST["layerName"];
			$data = json_decode($_POST["data"]);
			updateStyles($mapFile, $layerName, $data);
		}
	}

	function getSymbols($mapFile) {
		$attr = "{'attributes':[";

		$map = new mapObj($mapFile);

		//get symbols from within mapfile and referenced symbolset file.
		for ($i=1; $i < $map->getNumSymbols(); $i++) {
			$symbolName = $map->getSymbolObjectById($i)->name;
			$symbolTypeConst = $map->getSymbolObjectById($i)->type;
			switch ($symbolTypeConst) {
				case '1001':
					$symbolType = 'vector';
					break;

				case '1002':
					$symbolType = 'ellipse';
					break;

				case '1003':
					$symbolType = 'pixmap';
					break;

				case '1004':
					$symbolType = 'truetype';
					break;

				case '1005':
					$symbolType = 'hatch';
					break;

				default:
					break;
			}
			$attr .= "{'name':'$symbolName', 'type':'$symbolType'},";
		}

		$attr .= "]}";

		return $attr;
	}

	function saveToMapFile($map,$layer,$field,$style,$breaks,$colors,$mapfile) {
		$type = $style;
		//remove old classes for layer $layer
		while ($layer->numclasses > 0) {
		    $layer->removeClass(0);
		}

		//create classObject (set Name(Layername), set Expression(filter for different styling))
		for ($i=0; $i < count($breaks); $i++) {
			$class = new classObj($layer);

			if ($type == "cs") {
				$class->set("name",$breaks[$i]);
				$class->setExpression("('[$field]' = '$breaks[$i]')");
			} else if ($type == "ss") {
				$class->set("name",$breaks[$i]);
			} else {
				$j= $i+1;
				//check if it is the starting class
				if ($i == 0) {
					$class->set("name", $breaks[$i] . " - " . $breaks[$j]);
					$class->setExpression("(([$field] >= $breaks[$i]) AND ([$field] <= $breaks[$j]))");
				} else if ($i < count($breaks)-1) {
					$class->set("name", $breaks[$i] . " - " . $breaks[$j]);
					$class->setExpression("(([$field] > $breaks[$i]) AND ([$field] <= $breaks[$j]))");
				} else {
					$class->set("name", 'No class');
				}
			}

			//create styleObject
			$style = new styleObj($class);
			$style->color->setRGB($colors[$i][0],$colors[$i][1],$colors[$i][2]);

			if ($layer->type == 0) { //Point
				$style->size = 4;
				$style->outlinecolor->setRGB(0,0,0);
				$style->symbolname = "circle";
			} else if ($layer->type == 1) { //Line
				$style->width = 2;
			} else if ($layer->type == 2) { //Polygon
				$style->width = 0.5;
				$style->outlinecolor->setRGB(0,0,0);
			}
		}

		//save map
		$map->save($mapfile);
	}

	function updateStyles($mapfile,$layerName,$data) {

		$map = new mapObj($mapfile);
		$layer = $map->getLayerByName($layerName);

		deleteAllStylesForClassesOfLayer($layer);

		foreach ($data as $value) {
			for ($i=0; $i < $layer->numclasses; $i++) {
				$class = $layer->getClass($i);

				if ($value->className == $class->name) {
					$newStyle = new styleObj($class);
					$newStyle->size = $value->size;
					$newStyle->width = $value->width;
					if ($value->symbol != "") {
						$newStyle->symbolname = $value->symbol;
					}
					if ($value->outlinecolor != "") {
						$outlinecolor = hex2rgb($value->outlinecolor);
						$newStyle->outlinecolor->setRGB($outlinecolor[0],$outlinecolor[1],$outlinecolor[2]);
					}
					if ($value->color != "") {
						$color = hex2rgb($value->color);
						$newStyle->color->setRGB($color[0],$color[1],$color[2]);
					}
					if ($value->angle != "") {
						$newStyle->angle = $value->angle;
					}
					if ($value->pattern != "") {
						$newStyle->updateFromString("PATTERN ".$value->pattern." END");
					}
					if ($value->gap != "") {
						$newStyle->gap = $value->gap;
					}
					if ($value->initialgap != "") {
						$newStyle->initialgap = $value->initialgap;
					}
				}
			}
		}

		$map->save($mapfile);
	}

	function deleteAllStylesForClassesOfLayer($layer) {

		for ($i=0; $i < $layer->numclasses; $i++) {
			$class = $layer->getClass($i);

			while ($class->numstyles > 0) {
				$class->deletestyle(0);
			}
		}
	}

	function getLayers($mapFile) {

		$attr = "{'attributes':[";

		$map = new mapObj($mapFile);
		$layers = $map->getAllLayerNames();
		foreach($layers as $layerName) {
			$layer = $map->getLayerByName($layerName);
			$name = $layer->name;
			$type = $layer->type;
			$minx = $layer->getExtent()->minx;
			$miny = $layer->getExtent()->miny;
			$maxx = $layer->getExtent()->maxx;
			$maxy = $layer->getExtent()->maxy;
			switch ($type) {
				case '0':
					$typeString = "Point";
					break;
				case '1':
					$typeString = "Line";
					break;
				case '2':
					$typeString = "Polygon";
					break;
				default:
					break;
			}
			$dataSource = $layer->data;
			$attr .= "{'id':'$name', 'layerName':'$name', 'type':'$typeString', 'datasource':'$dataSource', 'extent':{'minx':$minx,'miny':$miny,'maxx':$maxx,'maxy':$maxy}}, ";
		}

		$attr .= "]}";

		return $attr;
	}

	function getClassesForLayer($mapFile, $layerName) {

		$map = new mapObj($mapFile);
		$layer = $map->getLayerByName($layerName);

		$attr = "{'attributes':[";

		for ($i=0; $i < $layer->numclasses; $i++) {
			$class = $layer->getClass($i);
			$expression = $class->getExpressionString();
			$name = utf8_decode($class->name);
			// error_log(htmlentities($name, ENT_COMPAT | ENT_HTML5, "ISO8859-1", false));
			$attr .= "{'id':'$name','name':'$name','index':'$i'},";
		}

		$attr .= "]}";

		return $attr;
	}

	function getLayerAttributes($dataSource, $layerName, $onlyContinuesAttributes) {

		$attr = "{'attributes':[";

		$ogrinfoQuery = 'ogrinfo -q ' . $dataSource . ' -sql "SELECT * FROM ' . $layerName . '" -fid 1';
		$ogrinfo = array();
		$result = array();
		exec($ogrinfoQuery,$ogrinfo);
		if ($onlyContinuesAttributes == "true") {
			for ($i=3; $i < count($ogrinfo); $i++) {
				if (strpos($ogrinfo[$i], "(Real)") || strpos($ogrinfo[$i], "(Integer)")) {
					$field = explode(" (", $ogrinfo[$i]);
					$field = trim($field[0]);
					array_push($result, $field);
					$attr .= "{'attributeName':'$field', 'abbr':'$field'},";
				}
			}
		} else {
			for ($i=3; $i < count($ogrinfo); $i++) {
				$field = explode(" (", $ogrinfo[$i]);
				$field = trim($field[0]);
				array_push($result, $field);
				$attr .= "{'attributeName':'$field', 'abbr':'$field'},";
			}
		}

		$attr .= "]}";

		return $attr;

		// return $result;
	}

	// deprecated
	function getStylesForClass($mapFile, $layerName, $classIndex) {
		$attr = "{'attributes':[";

		$map = new mapObj($mapFile);
		$layer = $map->getLayerByName($layerName);
		$class = $layer->getClass($classIndex);

		for ($i=0; $i < $class->numstyles; $i++) {
			$style = $class->getStyle($i);
			$color = rgb2hex([$style->color->red,$style->color->green,$style->color->blue]);
			$outlineColor = rgb2hex([$style->outlinecolor->red,$style->color->green,$style->color->blue]);
			$width = $style->width;
			$size = $style->size;
			$symbol = $style->symbolname;
			$attr .= "{'color':'$color', 'outlinecolor':'$outlinecolor', 'width':'$width', 'size':'$size', 'symbol':'$symbol'},";
		}

		$attr .= "]}";

		return $attr;
	}

	function getStylesForClasses($mapFile, $layerName) {
		$attr = "{'attributes':[";

		$map = new mapObj($mapFile);
		$layer = $map->getLayerByName($layerName);

		for ($i=0; $i < $layer->numclasses; $i++) {
			$class = $layer->getClass($i);
			$className = $class->name;
			$index = 0;
			// $color = "";
			// $outlineColor = "";
			// $width = "";
			// $size = "";
			// $symbol = "";
			// $pattern = "";
			$patternString = "";
			// $gap = "";
			for ($j=0; $j < $class->numstyles; $j++) {
				$style = $class->getStyle($j);
				$color = rgb2hex([$style->color->red,$style->color->green,$style->color->blue]);
				$outlineColor = rgb2hex([$style->outlinecolor->red,$style->outlinecolor->green,$style->outlinecolor->blue]);
				$width = $style->width;
				$size = $style->size;
				$symbol = $style->symbolname;
				$angle = $style->angle;
				$pattern = $style->getPatternArray();
				foreach ($pattern as $value) {
					$patternString .= " ".$value;
				}
				$gap = $style->gap;
				$index++;
				$attr .= "{'color':'$color', 'outlinecolor':'$outlineColor', 'width':'$width', 'size':'$size', 'symbol':'$symbol', 'className':'$className', 'index':'$index', 'gap':'$gap', 'angle':'$angle', 'pattern':'$patternString'},";
			}
		}

		$attr .= "]}";

		return $attr;
	}

	function getNumOfFeatures($map,$layer,$field) {
		$resultArray = array();

		// $map = new mapObj($mapFile);
		// $layer = $map->getLayerByName($layerName);

		$status = $layer->open();
		$status = $layer->whichShapes($map->extent);
		while ($shape = $layer->nextShape())
		{
			if (!empty($shape->values[$field])) {
				if (!in_array($shape->values[$field], $resultArray)) {
					array_push($resultArray, $shape->values[$field]);
				}
			}
		}
		$layer->close();

		return $resultArray;
	}
?>
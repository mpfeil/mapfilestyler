# MapFileStyler (MFS)
MapFileStyler is a graphical user interface to style [MapServer](http://www.mapserver.org/index.html) [Mapfiles](http://www.mapserver.org/mapfile/). It enables the user to load a Mapfile, select a specific layer and to classify the data based on different statistical methods or restyle the classifications.
Furthermore a live preview of the Mapfile is provided so that the changes are immediately visible to the user.


## Pre-Requirements
To run MapFileStyler you have to install [PHP](https://php.net/), MapServer and [PHP MapScript](http://mapserver.org/el/mapscript/php/index.html). The next two sections explain the installation on a Mac.
If you are running Linux or Windows please have a look at the install manuals:
* [PHP](http://php.net/manual/en/install.php)
* [MapServer](http://www.mapserver.org/installation/index.html)
* [PHP MapScript](http://mapserver.org/de/installation/php.html)

### PHP
At least `PHP 5.2.0`  is required and comes preinstalled on a Mac since Mac OS X 10.5 (Leopard) but has to be enabled in most of the cases. A good tutorial how to **enable PHP and Apache** can be found [here](http://foundationphp.com/tutorials/php_leopard.php).

### MapServer and PHP MapScript
To install MapServer and PHP MapScript I recommend to use [Homebrew](http://brew.sh/) a package manager for OS X.
For installation run:
```
brew install mapserver --with-php
```

## Installation

### For developers

MapFileStyler is based on [ExtJS](http://www.sencha.com/) `Version 4.2.1` and [GeoExt](http://geoext.github.io/geoext2/) `Version 2.0.1`.

Clone this repository `git clone URL` and run `npm install && bower install`.

#### Project structure and important files
* `src/` - contains the source of the application
  * `index.html` - main html file of the application
  * `app.js` - sets up the ExtJS application
  * `app/` - contains all containers, views, models and stores
  * `php/` - contains all files for PHP backend
    * `MapScriptHelper.php` - provides all methods to read and write Mapfiles
    * `statistics.php` - provides all statistical methods for classifying data
    * `functions.php` - provides utility methods
  * `ux/` - provides customized UX components
  * `vendor` - contains the GeoExt2 - JavaScript Toolkit

### For users
Download this repository as ZIP and extract it. Go to the extracted folder, open the `src/` subfolder and open `index.html` in your browser.

# MapScript API
This section describes the different GET and POST methods to read and write MapFiles.

## GET

### getLayers(*string mapfilepath*)
Takes a *mapfilepath* like `/Library/WebServer/Documents/MapFiles/placespt.map` and returns a JSON object.
```javascript
{'attributes':[{'id':'places','layerName':'places','type':'Point','datasource':'/Library/WebServer/Documents/MapFiles/PortugalSHapes/places.shp','extent':{'minx':-17.2480004,'miny':32.6360875,'maxx':-6.186571,'maxy':42.1389819}},]}
```

-------------------------------

### getLayerAttributes(*string datasource*,*string layername*,[*boolean onlyContinuesAttributes*])
Takes the *datasource* (e.g. shp,json) of a layer, the layername and returns all attributes in JSON notation. Optional is *onlyContinuesAttributes*. Set it to get only the continues attributes.
> There is always a class for non classified data!

```javascript
{'attributes':[{'attributeName':'osm_id', 'abbr':'osm_id'},{'attributeName':'name', 'abbr':'name'},{'attributeName':'type', 'abbr':'type'},{'attributeName':'population', 'abbr':'population'},{'attributeName':'POINT', 'abbr':'POINT'},{'attributeName':'', 'abbr':''},]}
```

--------------------------

### getClassesForLayer(*string mapfilepath*,*string layername*)
Takes a *mapfilepath* like `/Library/WebServer/Documents/MapFiles/placespt.map` and a *layername* and returns a JSON object.
```javascript
{'attributes':[{'id':'29 - 2112458.8','name':'29 - 2112458.8','index':'0'},{'id':'2112458.8 - 4224888.6','name':'2112458.8 - 4224888.6','index':'1'},{'id':'4224888.6 - 6337318.4','name':'4224888.6 - 6337318.4','index':'2'},{'id':'6337318.4 - 8449748.2','name':'6337318.4 - 8449748.2','index':'3'},{'id':'8449748.2 - 10562178','name':'8449748.2 - 10562178','index':'4'},{'id':'No class','name':'No class','index':'5'},]}
```

-----------------------------------------------------------

### getStylesForClasses(*string mapfilepath*,*string layername*)
Takes a *mapfilepath* like `/Library/WebServer/Documents/MapFiles/placespt.map` and a *layername* and returns a JSON object containing all styles for the classes.

> The styles are identified by `className` and `index indicates in which order the different styles for one class are rendered!

```javascript
{'attributes':[{'color':'#a04141', 'outlinecolor':'#000000', 'width':'1', 'size':'4', 'symbol':'circle', 'className':'29 - 2112458.8', 'index':'1', 'gap':'0', 'angle':'0', 'pattern':''},{'color':'#884e53', 'outlinecolor':'#000000', 'width':'1', 'size':'4', 'symbol':'circle', 'className':'2112458.8 - 4224888.6', 'index':'1', 'gap':'0', 'angle':'0', 'pattern':''},{'color':'#705b65', 'outlinecolor':'#000000', 'width':'1', 'size':'4', 'symbol':'circle', 'className':'4224888.6 - 6337318.4', 'index':'1', 'gap':'0', 'angle':'0', 'pattern':''},{'color':'#596876', 'outlinecolor':'#000000', 'width':'1', 'size':'4', 'symbol':'circle', 'className':'6337318.4 - 8449748.2', 'index':'1', 'gap':'0', 'angle':'0', 'pattern':''},{'color':'#417588', 'outlinecolor':'#000000', 'width':'1', 'size':'4', 'symbol':'circle', 'className':'8449748.2 - 10562178', 'index':'1', 'gap':'0', 'angle':'0', 'pattern':''},{'color':'#e13634', 'outlinecolor':'#000000', 'width':'1', 'size':'4', 'symbol':'circle', 'className':'No class', 'index':'1', 'gap':'0', 'angle':'0', 'pattern':''},]}
```

------------------------------------------------------------

### getSymbols(*string mapfilepath*)
Takes a *mapfilepath* like `/Library/WebServer/Documents/MapFiles/placespt.map` and returns a JSON object. The JSON contains all Mapserver Symbols defined inside the Mapfile or in an externally linked Symbolset.
```javascript
{'attributes':[{'name':'sld_mark_symbol_circle_filled','type':'ellipse'},{'name':'hatchsymbol','type':'hatch'},{'name':'circlef', 'type':'ellipse'},{'name':'natcap','type':'truetype'},{'name':'in_the_star','type':'pixmap'},{'name':'circle','type':'ellipse'},{'name':'quadrat', 'type':'vector'},{'name':'cross','type':'vector'},]}
```

--------------------------------

## POST

### applyNewClassification(*string mapfilepath*,*string layername*,*string attribute*,*string method*,*integer classes*,[*string startcolor*,*string endcolor*])

Will delete all existing classifications and applyies the new classification based on the `method` and `classes`.

| Type    | Parameter   | Note                                               | Default|
| ------- | ----------- | ---------------------------------------------------|--------|
| String  | mapfilepath | mapfilepath                                        |        |
| String  | layername   | layername                                          |        |
| String  | attribute   | attribute to classify                              |        |
| String  | method      | can be ss(single), cs (categorized), gs (graduated)|        |
| String  | type        | provide if method is *gs*, can be ei,qec,nb,sd,pb  |        |
| Integer | classes     | number of classes                                  |        |
| String  | startcolor  | startcolor for color range optional                | #FFFFFF|
| String  | endcolor    | endcolor for color range optionl                   | #FFFFFF|

> types:
* ei = Equal Interval
* qec = Quantile (Equal Count)
* nb = Natural Breaks
* sd = Standard Deviation
* pb = Pretty Breaks

```javascript
Ext.Ajax.request({
  method: 'POST',
  url: 'php/MapScriptHelper.php',
  params: {
    function: 'applyNewClassification',
    mapFile: mapFile,
    layerName: layerName,
    type: type,
    attribute: attribute,
    method: method,
    classes: classes,
    startColor: startColor,
    endColor: endColor
  },
  success: function(response){

  }
});
```

-------------------------------------------------------------------------

### updateStyles(*string mapfilepath*,*string layername*,*string data*)
Will update all defined *styles*. `data` must be JSON encoded.

Example for ExtJS how to encode JSON from Store.
```javascript
var jsonData = Ext.encode(Ext.Array.pluck(styleStore.data.items, 'data'));
```

```javascript
Ext.Ajax.request({
    method: 'POST',
    url: 'php/MapScriptHelper.php',
    params: {
        function: 'updateStyles',
        mapFile: mapFile,
        layerName: layerName,
        data: jsonData
    },
    success: function(response){

    }
});
```
-------------------------------------------------------------------
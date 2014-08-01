Ext.application({
  name: 'MFS',

  // All the paths for custom classes
  paths: {
    'Ext.ux': 'ux',
    'GeoExt': 'vendor/GeoExt',
  },

  autoCreateViewport: true,

  models: ['Attribute', 'Class', 'Layer', 'Style', 'Symbol'],
  stores: ['Attributes', 'Classes', 'Layers', 'Styles', 'Symbols', 'Types', 'Methods'],

  launch: function(){

    Ext.onReady(function(){

      var map = new OpenLayers.Map({});
      var layer;

      var layerStore = Ext.getStore('Layers');
      var attributesStore = Ext.getStore('Attributes');
      var classesStore = Ext.getStore('Classes');
      var styleStore = Ext.getStore('Styles');
      var symbolStore = Ext.getStore('Symbols');

      var mapFile = Ext.create('Ext.form.Panel', {
        title: 'Mapfile',
        width: 900,
        bodyPadding: 10,
        renderTo: Ext.getBody(),
        items: [{
          xtype: 'fieldcontainer',
          layout: 'hbox',
          items:[
            {
              xtype: 'textfield',
              fieldLabel: 'Mapfile',
              id: 'mapFilePath',
              msgTarget: 'side',
              allowBlank: false,
              blankText: 'Please specify a mapfile!'
            },
            {
              xtype: 'button',
              text: 'Get layers',
              handler: function() {

                // load layers from mapfile
                var mapFile = Ext.getCmp('mapFilePath').getValue();
                layerStore.getProxy().setExtraParam('function','getLayers');
                layerStore.getProxy().setExtraParam('mapFile',mapFile);
                layerStore.load(function(records, operation, success){
                  if (!success || records.length == 0) {
                    Ext.getCmp('mapFilePath').markInvalid('Please check the mapfile path!');

                    Ext.getCmp('cbLayer').setDisabled(true);

                    Ext.getCmp('cbType').setDisabled(true);
                    Ext.getCmp('cbAttribute').setDisabled(true);
                    Ext.getCmp('colorRange').setDisabled(true);
                  } else {
                    // load symbols from linked symbol file or included in the mapfile
                    symbolStore.getProxy().setExtraParam('function','getSymbols');
                    symbolStore.getProxy().setExtraParam('mapFile',mapFile);
                    symbolStore.load();

                    Ext.getCmp('cbLayer').setDisabled(false);
                  }
                });
              }
            }
          ]
        }]
      });

      function checkApplyButton() {

        var type = Ext.getCmp('cbType').getValue();
        var attribute = Ext.getCmp('cbAttribute').getValue();
        var method = Ext.getCmp('cbMethod').getValue();
        var numOfClasses = Ext.getCmp('nfClasses').getValue();

        if ( ( type == 'cs' || type == 'ss' ) && attribute ) {
          Ext.getCmp('applyClass').setDisabled(false);
        } else if ( type == 'gs' && attribute && method && numOfClasses) {
          Ext.getCmp('applyClass').setDisabled(false);
        } else {
          Ext.getCmp('applyClass').setDisabled(true);
        };
      }

      var layer = Ext.create('Ext.form.Panel', {
        title: 'Layers',
        width: 900,
        bodyPadding: 10,
        renderTo: Ext.getBody(),
        items: [{
          xtype: 'combobox',
          store: layerStore,
          queryMode: 'local',
          displayField: 'layerName',
          valueField: 'layerName',
          fieldLabel: 'Layer',
          disabled: true,
          editable: false,
          id: 'cbLayer',
          listeners: {
            select: {
              fn: function(combo,value) {

                attributesStore.getProxy().setExtraParam('function','getLayerAttributes');
                attributesStore.getProxy().setExtraParam('dataSource',value[0].data.datasource);
                attributesStore.getProxy().setExtraParam('layerName',value[0].data.layerName);
                attributesStore.getProxy().setExtraParam('onlyContinuesAttributes', false);
                attributesStore.load();

                classesStore.getProxy().setExtraParam('function','getClassesForLayer');
                classesStore.getProxy().setExtraParam('mapFile',Ext.getCmp('mapFilePath').getValue());
                classesStore.getProxy().setExtraParam('layerName',value[0].data.layerName);
                classesStore.load();

                styleStore.getProxy().setExtraParam('function','getStylesForClasses');
                styleStore.getProxy().setExtraParam('mapFile',Ext.getCmp('mapFilePath').getValue());
                styleStore.getProxy().setExtraParam('layerName',value[0].data.layerName);
                styleStore.load();

                var minx = layerStore.getById(value[0].data.layerName).data.extent.minx;
                var miny = layerStore.getById(value[0].data.layerName).data.extent.miny;
                var maxx = layerStore.getById(value[0].data.layerName).data.extent.maxx;
                var maxy = layerStore.getById(value[0].data.layerName).data.extent.maxy;

                layer = new OpenLayers.Layer.WMS(
                    "OpenLayers WMS",
                    "http://localhost/cgi-bin/mapserv?map="+Ext.getCmp('mapFilePath').getValue(),
                    {
                      layers: value[0].data.layerName
                    }
                );

                map.addLayers([layer]);

                GeoExt.panel.Map.guess().map.zoomToExtent([minx,miny,maxx,maxy]);

                Ext.getCmp('cbType').setDisabled(false);
                Ext.getCmp('cbAttribute').setDisabled(false);
                Ext.getCmp('colorRange').setDisabled(false);
              }
            }
          }
        }]
      });

      var classification = Ext.create('Ext.form.Panel', {
        title: 'Classification',
        width: 900,
        bodyPadding: 10,
        renderTo: Ext.getBody(),
        items: [{
          xtype: 'combobox',
          store: 'Types',
          queryMode: 'local',
          displayField: 'name',
          valueField: 'abbr',
          fieldLabel: 'Type',
          disabled: true,
          editable: false,
          id: 'cbType',
          listeners: {
            select: {
              fn: function(combo,value) {

                var datasource = '';

                layerStore.each(function(record){
                  if (record.get('layerName') == Ext.getCmp('cbLayer').getValue()) {
                    datasource = record.get('datasource');
                  };
                });

                attributesStore.getProxy().setExtraParam('dataSource',datasource);
                attributesStore.getProxy().setExtraParam('layerName',Ext.getCmp('cbLayer').getValue());
                switch(value[0].data.abbr) {
                  case "cs":
                    Ext.getCmp('cbMethod').hide();
                    Ext.getCmp('nfClasses').hide();
                    Ext.getCmp('colorLabel').show();
                    Ext.getCmp('endColor').show();
                    break;
                  case "gs":
                    attributesStore.getProxy().setExtraParam('onlyContinuesAttributes', true);
                    Ext.getCmp('cbMethod').show();
                    Ext.getCmp('nfClasses').show();
                    Ext.getCmp('colorLabel').show();
                    Ext.getCmp('endColor').show();
                    break;
                  default:
                    attributesStore.getProxy().setExtraParam('onlyContinuesAttributes', false);
                    Ext.getCmp('cbMethod').hide();
                    Ext.getCmp('nfClasses').hide();
                    Ext.getCmp('colorLabel').hide();
                    Ext.getCmp('endColor').hide();
                    break;
                }
                attributesStore.load();

                checkApplyButton();
              }
            }
          }
        },{
          xtype: 'combobox',
          store: 'Attributes',
          queryMode: 'local',
          displayField: 'attributeName',
          valueField: 'abbr',
          fieldLabel: 'Attribute',
          disabled: true,
          editable: false,
          id: 'cbAttribute',
          listeners: {
            select: {
              fn: function(combo,value) {
                checkApplyButton(combo,value);
              }
            }
          }
        },{
          xtype: 'combobox',
          fieldLabel: 'Methods',
          store: 'Methods',
          queryMode: 'local',
          displayField: 'name',
          valueField: 'abbr',
          id: 'cbMethod',
          editable: false,
          hidden: 'true',
          listeners: {
            select: {
              fn: function(combo, value) {
                checkApplyButton();
              }
            }
          }
        },{
          xtype: 'numberfield',
          fieldLabel: 'Number of classes',
          minValue: 0,
          maxValue: 20,
          id: 'nfClasses',
          hidden: 'true',
          listeners: {
            'change': function() {
              checkApplyButton();
            }
          }
        },
        {
          xtype: 'fieldcontainer',
          fieldLabel: 'Color',
          layout: 'hbox',
          id: 'colorRange',
          disabled: true,
          items:[
            {
              xtype: 'ux.colorpickerfield',
              id: 'startColor'
            },{
              xtype: 'label',
              text: '-',
              margin: '5 10 5 10',
              id: 'colorLabel'
            },{
              xtype: 'ux.colorpickerfield',
              id: 'endColor',
            }
          ]
        },
        {
          xtype: 'button',
          id: 'applyClass',
          text: 'Apply',
          disabled: true,
          handler: function() {

            //Clear stylestore and classstore
            classesStore.loadData([],false);
            styleStore.loadData([],false);

            //Write new styles to mapfile
            var mapFile = Ext.getCmp('mapFilePath').getValue();
            var layerName = Ext.getCmp('cbLayer').getValue();
            var type = Ext.getCmp('cbType').getValue();
            var attribute = Ext.getCmp('cbAttribute').getValue();
            var method = Ext.getCmp('cbMethod').getValue();
            var classes = Ext.getCmp('nfClasses').getValue();
            var startColor = Ext.getCmp('startColor').getValue();
            var endColor = Ext.getCmp('endColor').getValue();

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
                //Load changes after successful write
                classesStore.getProxy().setExtraParam('function','getClassesForLayer');
                classesStore.getProxy().setExtraParam('mapFile',Ext.getCmp('mapFilePath').getValue());
                classesStore.getProxy().setExtraParam('layerName',Ext.getCmp('cbLayer').getValue());
                classesStore.load();

                styleStore.getProxy().setExtraParam('function','getStylesForClasses');
                styleStore.getProxy().setExtraParam('mapFile',Ext.getCmp('mapFilePath').getValue());
                styleStore.getProxy().setExtraParam('layerName',Ext.getCmp('cbLayer').getValue());
                styleStore.load();
              }
            });
          }
        }]
      });

      var cellEditing = new Ext.grid.plugin.CellEditing({
        clicksToEdit: 1
      });

      cellEditing.on('edit', function(editor,e) {
        e.record.commit();
      });

      var columns = [
        {
          xtype: 'gridcolumn',
          text: "Color",
          flex: 1,
          editor: {
              xtype: 'ux.colorpickerfield',
          },
          dataIndex: "color",
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: "Outlinecolor",
          flex: 1,
          editor:{
            xtype: 'ux.colorpickerfield',
          },
          dataIndex: "outlinecolor",
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: "Width",
          flex: 1,
          dataIndex: "width",
          editor: {
            xtype: 'numberfield',
            minValue: 0,
            maxValue: 20
          },
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: "Size",
          flex: 1,
          dataIndex: "size",
          editor: {
            xtype: 'numberfield',
            minValue: 0,
            maxValue: 20
          },
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: 'Angle',
          flex: 1,
          dataIndex: 'angle',
          editor: {
            xtype: 'numberfield',
            minValue: 0,
            maxValue: 360
          },
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: 'Pattern',
          flex: 1,
          dataIndex: 'pattern',
          editor: {
            xtype: 'textfield'
          },
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: 'Gap',
          flex: 1,
          dataIndex: 'gap',
          editor: {
            xtype: 'numberfield'
          },
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: 'Initialgap',
          flex: 1,
          dataIndex: 'initialgap',
          editor: {
            xtype: 'numberfield'
          },
          resizable: false,
          sortable: false
        },
        {
          xtype: 'gridcolumn',
          text: "Symbol",
          flex: 1,
          dataIndex: "symbol",
          editor: new Ext.form.field.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            store: symbolStore,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
          }),
          resizable: false,
          sortable: false
        },
        {
          xtype: 'actioncolumn',
          width: 30,
          sortable: false,
          menuDisabled: true,
          items: [{
            icon: 'images/delete.gif',
            tooltip: 'Delete Style',
            handler: function(grid, rowIndex) {
              grid.getStore().removeAt(rowIndex);
            }
          }]
        }
      ];

      var grid = new Ext.grid.GridPanel({
        store: classesStore,
        columns: [
          {
            xtype: 'gridcolumn',
            text: "Class",
            flex: 1,
            dataIndex: "name",
            editor:'textfield',
            resizable: false,
            sortable: false
          }
        ],
        plugins: [{
          ptype: 'rowexpanderplus',
          pluginId: 'rowexpanderplus',
          selectRowOnExpand: true,
          expandOnDblClick: false,
          rowBodyTpl: ['<div id="ClassGridRow-{id}" ></div>']
        }],
        viewConfig: {
          listeners: {
            expandbody : function(rowNode,record,expandbody,eOpts) {
              styleStore.clearFilter();

              styleStore.filter({
                property: 'className',
                value: record.get('name'),
                exactMatch: true,
                caseSensitive: true
              });

              var className = record.get('name');

              var targetId = 'ClassGridRow-' + record.get('id');
              if (Ext.getCmp(targetId + "_grid") == null) {

                var classGridRow = Ext.create('Ext.grid.Panel',{
                  store: styleStore,
                  forceFit: true,
                  columns: columns,
                  // selType: 'cellmodel',
                  plugins:[
                    cellEditing
                  ],
                  // viewConfig: {
                  //   plugins: {
                  //     ptype: 'gridviewdragdrop',
                  //     dragText: 'Drag and drop to reorder'
                  //   }
                  // },
                  tbar: [{
                    text: 'Add Style',
                    scope: Ext.grid.dummyStyleData,
                    handler: function(e,c) {
                      console.log('add new style');

                      //Create new Style
                      var index = styleStore.getCount()+1;
                      var newStyle = Ext.create('MFS.model.Style', {
                        color: "#000000",
                        outlinecolor: "#000000",
                        width: 1,
                        size: 1,
                        symbol: "",
                        className: className,
                        index: styleStore.getCount()+1
                      });

                      //add it to store
                      styleStore.add(newStyle);
                      styleStore.commitChanges();
                    }
                  }],
                  renderTo: targetId,
                  id: targetId + "_grid",
                });
                rowNode.grid = classGridRow;
                classGridRow.getEl().swallowEvent(['mouseover', 'mousedown', 'click', 'dblclick', 'onRowFocus']);
                classGridRow.fireEvent("bind", classGridRow, { id: record.get('id') });
              } else {
                var grid = Ext.getCmp(targetId + "_grid");
                cellEditing.init(grid);
                grid.plugins.push(cellEditing);
                grid.getView().refresh();
              }
            }
          },
        },
        width: 900,
        height: 450,
        title: 'Styling your classes',
        iconCls: 'icon-grid',
        margin: '0 0 20 0',
        renderTo: Ext.getBody(),
        tbar: [{
          text: 'Apply new styles',
          id: 'applyNewStyles',
          disabled: true,
          handler: function() {

            styleStore.clearFilter();

            var mapFile = Ext.getCmp('mapFilePath').getValue();
            var layerName = Ext.getCmp('cbLayer').getValue();
            var jsonData = Ext.encode(Ext.Array.pluck(styleStore.data.items, 'data'));

            var exp = grid.getPlugin('rowexpanderplus');
            exp.collapseLastRow();

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

            layer.redraw(true);
          }
        },{
          text: 'Reload styles',
          handler: function() {
            styleStore.getProxy().setExtraParam('function','getStylesForClasses');
            styleStore.getProxy().setExtraParam('mapFile',Ext.getCmp('mapFilePath').getValue());
            styleStore.getProxy().setExtraParam('layerName',Ext.getCmp('cbLayer').getValue());
            styleStore.load();

            Ext.getCmp('applyNewStyles').setDisabled(true);

            layer.redraw(true);
          }
        }],
      });

      var mappanel = Ext.create('GeoExt.panel.Map', {
        title: 'MapFile Preview',
        height: 400,
        width: 900,
        region: 'center',
        map: map,
        center: '12.3046875,51.48193359375',
        zoom: 6,
        stateful: true,
        stateId: 'mappanel',
        renderTo: Ext.getBody(),
      });
    }); // end onReady
  } // end launch
});
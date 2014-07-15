Ext.define('MFS.view.Viewport', {
    extend: 'Ext.container.Viewport',

    requires: [
      'Ext.ux.RowExpanderPlus',
      'Ext.ux.colorpicker.ColorPicker',
      'Ext.ux.colorpicker.ColorPickerField',
      'GeoExt.panel.Map',
    ],

    layout: 'border',
    autoScroll: true
});
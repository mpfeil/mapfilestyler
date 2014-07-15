Ext.define('MFS.store.Layers', {
    extend: 'Ext.data.Store',

    requires: ['Ext.data.reader.Json'],

    model: 'MFS.model.Layer',

    autoLoad: false,

    proxy: {
        type: 'ajax',
        url: 'php/MapScriptHelper.php',
        reader: {
            type: 'json',
            root: 'attributes',
        }
    }
});
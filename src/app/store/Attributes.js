Ext.define('MFS.store.Attributes', {
    extend: 'Ext.data.Store',

    model: 'MFS.model.Attribute',

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
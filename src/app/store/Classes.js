Ext.define('MFS.store.Classes', {
    extend: 'Ext.data.Store',

    model: 'MFS.model.Class',

    autoLoad: false,

    proxy: {
        type: 'ajax',
        url: 'php/MapScriptHelper.php',
        reader: {
            type: 'json',
            root: 'attributes'
        }
    }
});
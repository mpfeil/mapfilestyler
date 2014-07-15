Ext.define('MFS.store.Styles', {
    extend: 'Ext.data.Store',

    model: 'MFS.model.Style',

    autoLoad: false,

    autoSync: false,

    proxy: {
        type: 'ajax',
        url: 'php/MapScriptHelper.php',
        reader: {
            type: 'json',
            root: 'attributes',
        },
        writer: {
            type: 'json',
            writeAllFields: true,
            root: 'data'
        }
    }
});
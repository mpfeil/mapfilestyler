Ext.define('MFS.model.Layer', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id'},
        {name: 'layerName', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'datasource', type: 'string'},
        {name: 'extent'}
    ],
    hasMany: {
        name: 'classes', model: 'Class'
    }
});
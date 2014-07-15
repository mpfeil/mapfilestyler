Ext.define('MFS.model.Class', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id'},
        {name: 'expression', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'index', type: 'string'}
    ],
});
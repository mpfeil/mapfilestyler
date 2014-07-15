Ext.define('MFS.model.Style', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'color', type: 'string'},
        {name: 'outlinecolor', type: 'string'},
        {name: 'width', type: 'float'},
        {name: 'size', type: 'float'},
        {name: 'symbol'},
        {name: 'className', type: 'string'},
        {name: 'index', type: 'float'},
        {name: 'angle', type: 'float'},
        {name: 'pattern'},
        {name: 'gap', type: 'float'},
        {name: 'initalgap', type: 'float'}
    ],
    belongsTo: 'Class'
});
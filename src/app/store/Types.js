Ext.define('MFS.store.Types', {
    extend: 'Ext.data.Store',

    fields: ['abbr', 'name'],

    data : [
        {"abbr":"ss", "name":"Single Symbol"},
        {"abbr":"cs", "name":"Categorized Symbol"},
        {"abbr":"gs", "name":"Graduated Symbol"}
    ]
});
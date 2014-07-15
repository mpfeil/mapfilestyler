Ext.define('MFS.store.Methods', {
  extend: 'Ext.data.Store',

  fields: ['abbr', 'name'],

  data : [
    {"abbr":"ei", "name":"Equal Interval"},
    {"abbr":"qec", "name":"Quantile (Equal Count)"},
    {"abbr":"nb", "name":"Natural Breaks"},
    {"abbr":"sd", "name":"Standard Deviation"},
    {"abbr":"pb", "name":"Pretty Breaks"}
  ]
});
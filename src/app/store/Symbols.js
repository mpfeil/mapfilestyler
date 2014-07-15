Ext.define('MFS.store.Symbols', {
  extend: 'Ext.data.Store',

  model: 'MFS.model.Symbol',

  autoLoad: false,

  autoSync: false,

  proxy: {
    type: 'ajax',
    url: 'php/MapScriptHelper.php',
    reader: {
      type: 'json',
      root: 'attributes'
    }
  }
});
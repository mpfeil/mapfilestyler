/**
* @class Ext.ux.RowExpanderPlus
* @extends Ext.ux.RowExpander
* Plugin (ptype = 'rowexpanderplus') s just a little addon for
* {@link Ext.ux.RowExpander RowExpander} plugin which adds two features:
* the ability to only have one expanded row
* and to collapse the last expanded row.
*
* @ptype rowexpanderplus
*/
Ext.define('Ext.ux.RowExpanderPlus', {
  extend: 'Ext.grid.plugin.RowExpander',

  alias: 'plugin.rowexpanderplus',

  /**
   * @cfg {Boolean} expandOnlyOne
   * true to allow only one expanded row
   * (defaults to true).
   */
  expandOnlyOne: true,

  lastExpandedRowIdx: null,

  // Overwrite RowExpander.toggleRow(rowIdx)
  toggleRow: function(rowIdx) {
    var row = Ext.get(this.view.getNode(rowIdx));
    if (row.hasCls(this.rowCollapsedCls)) {
      if (this.lastExpandedRowIdx != null && this.expandOnlyOne == true) {
        this.collapseRow(this.lastExpandedRowIdx);
      }
      this.expandRow(rowIdx);
      this.lastExpandedRowIdx = rowIdx;
    } else {
      this.collapseRow(rowIdx);
      this.lastExpandedRowIdx = null;
    }
  },

  expandRow: function(rowIdx) {
    var view = this.view,
        rowNode = view.getNode(rowIdx),
        row = Ext.get(rowNode),
        nextBd = Ext.get(row).down(this.rowBodyTrSelector),
        record = view.getRecord(rowNode);

        row.removeCls(this.rowCollapsedCls);
        nextBd.removeCls(this.rowBodyHiddenCls);
        this.recordsExpanded[record.internalId] = true;
        view.refreshSize();
        view.fireEvent('expandbody', rowNode, record, nextBd.dom);
  },

  collapseRow: function(rowIdx) {
    if (rowIdx != null) {
      var view = this.view,
          rowNode = view.getNode(rowIdx),
          row = Ext.get(rowNode),
          nextBd = Ext.get(row).down(this.rowBodyTrSelector),
          record = view.getRecord(rowNode);

          row.addCls(this.rowCollapsedCls);
          nextBd.addCls(this.rowBodyHiddenCls);
          this.recordsExpanded[record.internalId] = false;
          view.refreshSize();
          view.fireEvent('collapsebody', rowNode, record, nextBd.dom);
    };
  },

  /**
   * @method
   * Collapse the last expanded row.
   */
  collapseLastRow: function() {
    this.collapseRow(this.lastExpandedRowIdx);
  }

});
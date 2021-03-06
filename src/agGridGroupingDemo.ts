import { IDataSetConfiguration } from './IDataSetConfiguration';
import { AvailableDatasetConfigs } from './DatasetConfigsagGrid';
import { IAdaptableBlotter } from '../node_modules/adaptableblotter/dist/App_Scripts/Core/Interface/IAdaptableBlotter';
import { IDemo } from './IDemo';
import * as Helper from './Helper';
import { IAdaptableBlotterOptions } from 'adaptableblotter/dist/App_Scripts/Core/Interface/IAdaptableBlotterOptions';
import { Grid } from 'ag-grid/dist/lib/grid';
import { GridOptions } from 'ag-grid/dist/lib/entities/gridOptions';
import * as HelperAgGrid from "./HelperAgGrid"

export class agGridGroupingDemo implements IDemo {
    private themeName = "";
    private adaptableblotter: IAdaptableBlotter
    private grid: any
    constructor(private gridContainer: string, private blotterContainer: string) {

        // hardcode the data
        let datat: any = Helper.getDataFromJson("NorthwindOrders.json")


        let data: any[]
        Helper.getDataFromJson("NorthwindOrders.json").then(json => data = json)
            .then(data => Helper.MakeAllRecordsColumnsDateProperDates(data)).then(() => {
                var schema = []


                // do a column group for Customer
                schema.push({
                    headerName: "Customer Info",
                    marryChildren: true,
                    children: [
                        { headerName: "Customer Reference", field: "CustomerReference", columnGroupShow: 'open', editable: true, },
                        { headerName: "Company Name", field: "CompanyName", columnGroupShow: 'closed', editable: true, },
                        { headerName: "Contact Name", field: "ContactName", columnGroupShow: 'closed', },
                    ]
                })

                // do a column group for Order
                schema.push({
                    headerName: "Order",
                    marryChildren: true,
                    children: [
                        { headerName: "Order Id", field: "OrderId", editable: false, columnGroupShow: 'open', cellClass: 'number-cell' },
                        { headerName: "Order Date", field: "OrderDate", editable: true, columnGroupShow: 'closed', cellEditorParams: { useFormatter: true }, valueParser: HelperAgGrid.dateParseragGrid, valueFormatter: HelperAgGrid.shortDateFormatteragGrid },
                        { headerName: "Required Date", field: "RequiredDate", editable: true, columnGroupShow: 'closed', cellEditorParams: { useFormatter: true }, valueParser: HelperAgGrid.dateParseragGrid, valueFormatter: HelperAgGrid.shortDateFormatteragGrid },
                        { headerName: "Shipped Date", field: "ShippedDate", editable: true, columnGroupShow: 'closed', cellEditorParams: { useFormatter: true }, valueParser: HelperAgGrid.dateParseragGrid, valueFormatter: HelperAgGrid.shortDateFormatteragGrid },
                         { headerName: "OrderCost", field: "OrderCost", cellClass: 'number-cell', cellRenderer: HelperAgGrid.currencyRendereragGrid, columnGroupShow: 'closed', editable: true , enableValue:true},
                    ]
                })
                schema.push( { headerName: "Item Count", field: "ItemCount", cellClass: 'number-cell', columnGroupShow: 'closed', editable: false,  enableValue:true});
                schema.push({ headerName: "Employee", field: "Employee", filter: 'text', editable: true, enableRowGroup: true, hide: true });
                schema.push({ headerName: "Ship Via", field: "ShipVia", filter: 'text', editable: true, enableRowGroup: true, hide: true });
                schema.push({ headerName: "Freight", field: "Freight", cellClass: 'number-cell', cellRenderer: HelperAgGrid.currencyRendereragGrid, editable: false, enableValue:true});

                // do a column group for shipping
                schema.push({
                    headerName: "Shipping Details",
                    children: [
                        { headerName: "Ship Name", field: "ShipName", columnGroupShow: 'open', editable: true, },
                        { headerName: "Ship Address", field: "ShipAddress", columnGroupShow: 'closed', editable: true, },
                        { headerName: "Ship City", field: "ShipCity", columnGroupShow: 'closed', },
                        { headerName: "Ship Postal Code", field: "ShipPostalCode", columnGroupShow: 'closed', },
                    ]
                })


                schema.push({ headerName: "Ship Country", field: "ShipCountry", filter: 'text', editable: true, rowGroup: true, enableRowGroup: true, hide: true });





                // let the grid know which columns and what data to use
                var gridOptions: GridOptions = {
                    columnDefs: schema,
                    rowData: data,
                    enableSorting: true,
                    animateRows: true,
                    enableRangeSelection: true,
                    enableFilter: true,
                    groupMultiAutoColumn: false, // setting it to false until we fix issue: 209
                    groupUseEntireRow: false,
                    enableColResize: true,
                    onGridReady: function () {
                        //we do it twice as sometimes when the dataset is small columns that werent visible at all will become
                        //visible and won't be autosized
                        gridOptions.columnApi.autoSizeAllColumns("api");
                        setTimeout(() => gridOptions.columnApi.autoSizeAllColumns("api"), 1);

                        gridOptions.api.addEventListener("cellEditingStopped", (params: any) => {
                            //    selectedConfig.ActionWhenRecordUpdatedOrEdited(params.node);
                        });

                        gridOptions.api.addEventListener("newColumnsLoaded", function (params: any) {
                            gridOptions.columnApi.autoSizeAllColumns("api");
                        });
                    }
                };
                var eGridDiv = document.getElementById(gridContainer);
                var grid = new Grid(eGridDiv, gridOptions);



                //set all the properties such as editor etc....
                //  selectedConfig.setGridProperties(gridOptions)

                //create Adaptable Blotter
                var container = document.getElementById(blotterContainer);
                let blotterOptions: IAdaptableBlotterOptions = {
                    primaryKey: "OrderId",
                    userName: "Jonathan",
                    enableAuditLog: false,
                    enableRemoteConfigServer: false,
                    blotterId: "Northwind Orders" + process.env.packageVersion,
                    maxColumnValueItemsDisplayed: 1000,
                    predefinedConfigUrl: "NorthwindOrdersConfig.json"
                }
                this.adaptableblotter = new (<any>window).adaptableblotteraggrid.AdaptableBlotter(gridOptions, container, eGridDiv, blotterOptions);

                //We subscribe to the AB theme change so we update the theme of the grid (only light or dark for demo)
                this.adaptableblotter.AdaptableBlotterStore.TheStore.subscribe(() => { this.ThemeChange(); });
            })
    }


    public ThemeChange() {
        if (this.themeName != this.adaptableblotter.AdaptableBlotterStore.TheStore.getState().Theme.CurrentTheme) {
            this.themeName = this.adaptableblotter.AdaptableBlotterStore.TheStore.getState().Theme.CurrentTheme;
            var container = document.getElementById(this.gridContainer)
            if (this.themeName == "Slate" || this.themeName == "Cyborg" || this.themeName == "Darkly" || this.themeName == "Superhero") {
                container.className = "ag-theme-dark";
            }
            else {
                container.className = "ag-theme-blue";
            }
        }
    }
}
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("aisplaunpad007.controller.SplitApp", {
        onInit: function () {
            // Initialize model for master list
            const oModel = new JSONModel({
                items: [
                    { text: "Item 1" },
                    { text: "Item 2" },
                    { text: "Item 3" }
                ],
                selectedItem: {}
            });
            this.getView().setModel(oModel);
        },

        onItemSelect: function (oEvent) {
            const oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            const oContext = oItem.getBindingContext();
            const oData = oContext.getObject();
            this.getView().getModel().setProperty("/selectedItem", oData);
        },

        onNavBack: function () {
            // Notify View1 controller to handle navigation back
            const oNavContainer = this.getOwnerComponent().getRootControl().byId("pageContainer");
            const oView1Controller = oNavContainer.getParent().getParent().getController();
            oView1Controller.toggleToPreviousPage();
        }
    });
});
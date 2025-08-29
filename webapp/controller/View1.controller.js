sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/HTML"
], (Controller, JSONModel, MessageToast, BusyIndicator, HTML) => {
    "use strict";

    return Controller.extend("aisplaunpad007.controller.View1", {
        onInit: function () {

            const oAppListModel = this.getOwnerComponent().getModel("applicationList");
            this.getView().setModel(oAppListModel, "applicationList");
            

            const aData = oAppListModel.getData();
            const oSideNav = this.byId("sideNavigation");

            aData.forEach(app => {
                if (app.APP_TYPE === "GRP") {
                    const oGroupItem = new sap.tnt.NavigationListItem({
                        text: app.APP_TEXT,
                        icon: app.APP_ICON,
                        expanded: true
                    });

                    app.TO_SUBAPPINFO.forEach(sub => {
                        const oChild = new sap.tnt.NavigationListItem({
                            text: sub.S_APP_TEXT,
                            icon: sub.S_APP_ICON,
                            key: sub.ID
                        });

                        // Add a class via customData (DOM-visible)
                        oChild.addCustomData(new sap.ui.core.CustomData({
                            key: "class",
                            value: "subAppItem",
                            writeToDom: true
                        }));

                        oGroupItem.addItem(oChild);
                    });

                    oSideNav.addItem(oGroupItem);
                } else if (app.APP_TYPE === "APP") {
                    const sub = app.TO_SUBAPPINFO[0];
                    const oFlatItem = new sap.tnt.NavigationListItem({
                        text: sub.S_APP_TEXT,
                        icon: sub.S_APP_ICON,
                        key: sub.ID
                    });
                    oSideNav.addItem(oFlatItem);
                }
            });

            if (aData && aData.length > 0 && aData[0].TO_SUBAPPINFO.length > 0) {
                const firstApp = aData[0].TO_SUBAPPINFO[0];
                this.createIframeContent(firstApp.ID, firstApp.S_APP_TEXT, firstApp.S_APP_URL);
            }
        },



        createIframeContent: function (sKey, sText, sUrl) {
            this.getView().setBusy(true);

            const safeId = "page_" + sKey.replace(/[^a-zA-Z0-9_]/g, "_");
            const oNavContainer = this.getView().byId("pageContainer");

            let oExistingPage = oNavContainer.getPages().find(page => page.getId().includes(safeId));

            if (!oExistingPage) {
                const oHtml = new sap.ui.core.HTML({
                    content: `<iframe id="${safeId}_iframe" src="${sUrl}?mode=edit" width="100%" height="100%" frameborder="0"
                                allow-forms allow-same-origin allow-scripts allow-popups, allow-modals, allow-orientation-lock, allow-pointer-lock, allow-presentation, allow-popups-to-escape-sandbox, allow-top-navigation
                                style="min-height: 600px;"></iframe>`,
                    afterRendering: () => {
                        const iframe = document.getElementById(`${safeId}_iframe`);
                        if (iframe) {
                            iframe.onload = () => {
                                this.getView().setBusy(false);
                            };
                        }
                    }
                });

                oExistingPage = new sap.m.Page(safeId, {
                    showHeader: false,
                    title: sText,
                    titleAlignment: sap.m.TitleAlignment.Center,
                    content: [oHtml]
                });

                oNavContainer.addPage(oExistingPage);
            }

            oNavContainer.to(oExistingPage);

            // If iframe already existed, manually stop busy indicator
            if (oExistingPage && oExistingPage.getContent()[0].getMetadata().getName() === "sap.ui.core.HTML") {
                debugger;
                const iframe = document.getElementById(`${safeId}_iframe`);
                if (iframe) {
                    this.getView().setBusy(false);
                }
            }

            MessageToast.show("Navigated to: " + sText);
        },


        onItemSelect: function (oEvent) {
            const sKey = oEvent.getParameter("item").getKey();
            const aAppList = this.getView().getModel("applicationList").getData();
            const aAllApps = aAppList.flatMap(app => app.TO_SUBAPPINFO);
            const oSelectedApp = aAllApps.find(app => app.ID === sKey);

            if (oSelectedApp) {
                this.createIframeContent(oSelectedApp.ID, oSelectedApp.S_APP_TEXT, oSelectedApp.S_APP_URL);
            }
        },



        onNavtoHome: function () {
            var oData = this.getView().getModel("DashBoardInitial").getData()[0];
            this.createIframeContent(oData.key, oData.display_title_text, oData.url);
        },

        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
            oToolPage.setSideExpanded(!bSideExpanded);
            this.byId("sideNavigationToggleButton").setTooltip(
                bSideExpanded ? "Expand Navigation" : "Collapse Navigation"
            );
        },

        onPageNavigationFinished: function () {
            BusyIndicator.hide();
        }
    });
});
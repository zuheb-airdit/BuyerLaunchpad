sap.ui.define(
  ["sap/ui/core/UIComponent", "aisplaunpad007/model/models"],
  (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("aisplaunpad007.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();

        //TRACK ALL BATCH CALLS
        // this._TrackBatchCalls();
      },
      _TrackBatchCalls: function () {
        let sCurrentAppUrl = this.getModel("GlobalModel").getProperty(
          "/applications/0/currentURL"
        );

        let that = this;
        //window._batchHistory = [];

        // If app URL changed, reset history
        if (window._batchAppUrl !== sCurrentAppUrl) {
          window._batchAppUrl = sCurrentAppUrl;
          window._batchHistory = [];
        }
        (function (open, send) {
          XMLHttpRequest.prototype.open = function (method, url) {
            this._url = url; // store url
            return open.apply(this, arguments);
          };

          XMLHttpRequest.prototype.send = function (body) {
            if (this._url && this._url.includes("$batch")) {
              const batchEntry = {
                url: this._url,
                requestBody: body,
                responseBody: null,
                timestamp: new Date().toISOString(),
              };

              // Listen for response
              this.addEventListener("load", function () {
                try {
                  debugger;
                  //   let raw = this.responseText;
                  //   let parsedResults = that._extractBatchResults(raw);

                  //   batchEntry.responseBody = parsedResults; // only JSON results

                  if (this.responseURL && this.responseURL.includes(sCurrentAppUrl)) {
                    let raw = this.responseText;
                    let parsedResults = that._extractBatchResults(raw);
                    batchEntry.responseBody = parsedResults;

                    window._batchHistory.push(batchEntry);

                    // keep only last 10
                    if (window._batchHistory.length > 10) {
                      window._batchHistory.shift();
                    }
                  }
                } catch (err) {
                  batchEntry.responseBody = { error: err.message };
                }
              });

              this.addEventListener("error", function () {
                batchEntry.responseBody = "Error occurred";
                window._batchHistory.push(batchEntry);
              });
            }
            return send.apply(this, arguments);
          };
        })(XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.send);
      },
      _extractBatchResults: function (responseText) {
        let results = {};

        try {
          // Regex to capture any JSON object starting with { and ending with }
          let matches = responseText.match(/\{[\s\S]*?\}(?=\r\n|$)/g);

          if (matches) {
            matches.forEach((str) => {
              try {
                let json = JSON.parse(str.trim());
                if (json.d) {
                  results = json;
                }
              } catch (e) {
                // ignore invalid JSON chunks
              }
            });
          }
        } catch (err) {
          console.error("Batch parse error:", err);
        }

        return results;
      },
    });
  }
);

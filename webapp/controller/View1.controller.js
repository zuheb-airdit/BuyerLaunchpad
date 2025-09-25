sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/BusyIndicator",
    "sap/ui/core/HTML",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Image",
    "sap/m/Button",
  ],
  (
    Controller,
    JSONModel,
    MessageToast,
    BusyIndicator,
    HTML,
    VBox,
    HBox,
    Text,
    Image,
    Button
  ) => {
    "use strict";

    return Controller.extend("aisplaunpad007.controller.View1", {
      onInit: function () {
        //__________CHATBOT MODEL_______________//
        // let chatModel = new JSONModel({
        //   messages: [
        //     {
        //       text: "Hello! I’m your Contract Assistant. How can i help you today?",
        //       isUserMessage: false,
        //     }, // Bot
        //   ],
        // });
        this.oMessageModel = new JSONModel({
          messages: [],
        });
        this.getView().setModel(this.oMessageModel, "messageModel");
            this.typingInterval = null; // To store the typing interval for stopping

        var oModel = new sap.ui.model.json.JSONModel({
          pinnedChats: [
            {
              name: "Parle-G",
              message: "RFQ Reviewed....",
              lastActive: "1:20 PM",
              pinned: true,
            },
            {
              name: "Nestle",
              message: "quotation under review",
              lastActive: "1:22 PM",
              pinned: true,
            },
            {
              name: "Britannia",
              message: "let me know the status of...",
              lastActive: "1:23 PM",
              pinned: true,
            },
            {
              name: "Royal Enfield",
              message: "negotiations is in...",
              lastActive: "1:29 PM",
              pinned: false,
            },
          ],
          recentChats: [
            {
              name: "Patanjali",
              message: "absolutely right",
              lastActive: "1:30 PM",
              pinned: false,
            },
            {
              name: "Haldiram's",
              message: "RFQs",
              lastActive: "1:32 PM",
              pinned: false,
            },
            {
              name: "Tata Tea",
              message: "profile settings...",
              lastActive: "1:34 PM",
              pinned: false,
            },
            {
              name: "Sunfeast",
              message: "here is the detailed require...",
              lastActive: "1:36 PM",
              pinned: false,
            },
            {
              name: "Amul",
              message: "technical documentation included",
              lastActive: "1:38 PM",
              pinned: false,
            },
            {
              name: "MTR",
              message: "request clarification",
              lastActive: "1:40 PM",
              pinned: false,
            },
          ],
        });
        this.getView().setModel(oModel, "suppName");
        this.testChat();
        let globalModel = this.getOwnerComponent().getModel("GlobalModel");
        // this.getView().setModel(chatModel, "chat");

        const oAppListModel =
          this.getOwnerComponent().getModel("applicationList");
        this.getView().setModel(oAppListModel, "applicationList");

        const aData = oAppListModel.getData();
        const oSideNav = this.byId("sideNavigation");
        aData.forEach((app) => {
          if (app.APP_TYPE === "GRP") {
            const oGroupItem = new sap.tnt.NavigationListItem({
              text: app.APP_TEXT,
              icon: app.APP_ICON,
              expanded: true,
            });

            app.TO_SUBAPPINFO.forEach((sub) => {
              const oChild = new sap.tnt.NavigationListItem({
                text: sub.S_APP_TEXT,
                icon: sub.S_APP_ICON,
                key: sub.ID,
              });

              // Add a class via customData (DOM-visible)
              oChild.addCustomData(
                new sap.ui.core.CustomData({
                  key: "class",
                  value: "subAppItem",
                  writeToDom: true,
                })
              );

              oGroupItem.addItem(oChild);
            });

            oSideNav.addItem(oGroupItem);
          } else if (app.APP_TYPE === "APP") {
            const sub = app.TO_SUBAPPINFO[0];
            const oFlatItem = new sap.tnt.NavigationListItem({
              text: sub.S_APP_TEXT,
              icon: sub.S_APP_ICON,
              key: sub.ID,
            });
            oSideNav.addItem(oFlatItem);
          }
        });

        if (aData && aData.length > 0 && aData[0].TO_SUBAPPINFO.length > 0) {
          const firstApp = aData[0].TO_SUBAPPINFO[0];
          this.createIframeContent(
            firstApp.ID,
            firstApp.S_APP_TEXT,
            firstApp.S_APP_URL
          );
          globalModel.setProperty(
            "/applications/0/currentApp",
            firstApp.S_APP_TEXT
          );
          globalModel.setProperty(
            "/applications/0/currentURL",
            firstApp.S_APP_URL
          );
        }
      },

      createIframeContent: function (sKey, sText, sUrl) {
        this.getView().setBusy(true);

        const safeId = "page_" + sKey.replace(/[^a-zA-Z0-9_]/g, "_");
        const oNavContainer = this.getView().byId("pageContainer");

        let oExistingPage = oNavContainer
          .getPages()
          .find((page) => page.getId().includes(safeId));

        if (!oExistingPage) {
          const oHtml = new sap.ui.core.HTML({
            content: `<iframe id="${safeId}_iframe" src="${sUrl}?mode=edit" width="100%" height="100%" frameborder="0"
                                allow-forms allow-same-origin allow-scripts allow-popups, allow-modals, allow-orientation-lock, allow-pointer-lock, allow-presentation, allow-popups-to-escape-sandbox, allow-top-navigation
                                style="min-height: 600px;"></iframe>`,
            afterRendering: () => {
              this.getView().setBusy(false);
              // const iframe = document.getElementById(`${safeId}_iframe`);
              // if (iframe) {
              //     //iframe
              //     const iframe = document.getElementById(`${safeId}_iframe`);
              //     if (iframe) {
              //         iframe.onload = () => {
              //             this.getView().setBusy(false);

              //             // Access iframe's window since same origin
              //             const iframeWin = iframe.contentWindow;

              //             // Patch XHR inside iframe
              //             (function (open, send) {
              //                 iframeWin.XMLHttpRequest.prototype.open = function (method, url) {
              //                     this._url = url;
              //                     return open.apply(this, arguments);
              //                 };

              //                 iframeWin.XMLHttpRequest.prototype.send = function (body) {
              //                     if (this._url && this._url.includes("$batch")) {
              //                         console.log("📦 Iframe batch call:", this._url);

              //                         this.addEventListener("load", function () {
              //                             console.log("✅ Iframe batch response:", this.responseText);
              //                         });
              //                     }
              //                     return send.apply(this, arguments);
              //                 };
              //             })(iframeWin.XMLHttpRequest.prototype.open, iframeWin.XMLHttpRequest.prototype.send);
              //         };
              //     }

              // }
            },
          });

          oExistingPage = new sap.m.Page(safeId, {
            showHeader: false,
            title: sText,
            titleAlignment: sap.m.TitleAlignment.Center,
            content: [oHtml],
          });

          oNavContainer.addPage(oExistingPage);
        }

        oNavContainer.to(oExistingPage);

        // If iframe already existed, manually stop busy indicator
        if (
          oExistingPage &&
          oExistingPage.getContent()[0].getMetadata().getName() ===
            "sap.ui.core.HTML"
        ) {
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
        const aAllApps = aAppList.flatMap((app) => app.TO_SUBAPPINFO);
        const oSelectedApp = aAllApps.find((app) => app.ID === sKey);
        let globalModel = this.getOwnerComponent().getModel("GlobalModel");

        if (oSelectedApp) {
          this.createIframeContent(
            oSelectedApp.ID,
            oSelectedApp.S_APP_TEXT,
            oSelectedApp.S_APP_URL
          );

          // let currentAppModel = this.getView().getModel("currentAppModel");
          globalModel.setProperty(
            "/applications/0/currentApp",
            oSelectedApp.S_APP_TEXT
          );
          globalModel.setProperty(
            "/applications/0/currentURL",
            oSelectedApp.S_APP_URL.replace("/index.html", "")
          );
          window._batchHistory = []; //reset history
        }
      },

      onNavtoHome: function () {
        var oData = this.getView().getModel("DashBoardInitial").getData()[0];
        this.createIframeContent(
          oData.key,
          oData.display_title_text,
          oData.url
        );
      },

      onSideNavButtonPress: function () {
        var oToolPage = this.byId("toolPage");
        var bSideExpanded = oToolPage.getSideExpanded();
        oToolPage.setSideExpanded(!bSideExpanded);
        this.byId("sideNavigationToggleButton").setTooltip(
          bSideExpanded ? "Expand Navigation" : "Collapse Navigation"
        );
      },

      // onPageNavigationFinished: function () {
      //   BusyIndicator.hide();
      // },

      //CHAT BOT Sanju
      openChatbot: function (oEvent) {
        this.loadFragment({
          name: "aisplaunpad007.fragments.Chatbot",
        }).then((oDialog) => {
          this._oPopOverChatbot = oDialog;
          this._oPopOverChatbot.openBy(oEvent.getSource());
        });
      },
      handleClosePopOver: function (oEvent) {
        this._oPopOverChatbot.close();
      },
      handleOnAfterPopOverClose: function (oEvent) {
        this._oPopOverChatbot.destroy();
        this._oPopOverChatbot = null;
      },
      // onSendMessage: function () {
      //   var oView = this.getView();
      //   let oBusyBox = oView.byId("BusyBox");
      //   var oInput = oView.byId("messageInput");
      //   var userText = oInput.getValue();

      //   if (!userText) return;

      //   // Update chat model with user message
      //   var oChatModel = oView.getModel("chat");
      //   var aMessages = oChatModel.getProperty("/messages");
      //   aMessages.push({ text: userText, isUserMessage: true });
      //   oChatModel.setProperty("/messages", aMessages);
      //   oInput.setValue(""); // Clear input

      //   //GET RECENT BATCH REQUESTS
      //   let history = window._batchHistory || [];
      //   let oPayload = history
      //     .map((entry) => entry.responseBody) // take only responseBody
      //     .filter((body) => body !== undefined && body !== null); // remove empty ones
      //   console.log(oPayload);
      //   // Call chatbot API
      //   // oBusyBox.setBusy(true)
      //   // var that = this;
      //   // let apiKey = '718WUkW2rtmF_Q(E^uHCT*Mr@E0(ubRF'
      //   // $.ajax({
      //   //     url: "https://summarizer.cfapps.ap10.hana.ondemand.com/chat_with_me/",
      //   //     headers: {
      //   //         "X-Internal-API-Key": apiKey
      //   //     },
      //   //     type: "POST",
      //   //     contentType: "application/json",
      //   //     data: JSON.stringify({
      //   //         chat_text: `${userText}...KEEP IT UNDER 200 WORDS`,
      //   //         extracted_text: oModelData.docText
      //   //     }),
      //   //     success: function (response) {
      //   //         oBusyBox.setBusy(false)
      //   //         let sText;
      //   //         if (response.Output) {
      //   //             sText = response.Output
      //   //         } else if (response.Error) {
      //   //             sText = response.Error
      //   //         }
      //   //         that._addBotResponse(sText);
      //   //     },
      //   //     error: function () {
      //   //         oBusyBox.setBusy(false)
      //   //         that._addBotResponse("Sorry, I couldn't understand that.");
      //   //     }
      //   // });
      // },

      _addBotResponse: function (botText) {
        var oChatModel = this.getView().getModel("chat");
        var aMessages = oChatModel.getProperty("/messages");

        let formattedText = botText
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br/>");

        aMessages.push({ text: formattedText, isUserMessage: false });
        oChatModel.setProperty("/messages", aMessages);
      },

      onCopilotPress: function () {
        const oNavContainer = this.byId("pageContainer");
        const oSplitAppPage = this.byId("splitAppPage");

        // Store the current page if not already stored
        if (!this._oPreviousPage) {
          this._oPreviousPage = oNavContainer.getCurrentPage();
        }

        // Navigate to SplitApp page
        oNavContainer.to(oSplitAppPage);
        MessageToast.show("Navigated to SplitApp");
      },

      // testChat: function () {
      //   var oChatList = this.byId("chatList");
      //   oChatList.destroyItems(); // Clear existing items to avoid duplicates on re-render

      //   // Loop through messages and create dynamic HBox containers
      //   this.messages.forEach(
      //     function (message) {
      //       var oMessageBox = new HBox({
      //         alignItems: "Center",
      //         wrap: "Wrap", // Allow wrapping to multiple lines if needed
      //       }).addStyleClass(
      //         message.side === "left" ? "leftMessage" : "rightMessage"
      //         // Background for rightMessage handled via CSS
      //       );

      //       var oMessageVBox = new VBox({
      //         alignItems: "Center",
      //       }).addStyleClass("messageBox");

      //       // Calculate dynamic minimum width based on message length
      //       var dynamicLength = message.message.length;
      //       var maxLength = Math.max(
      //         ...this.messages.map((msg) => msg.message.length)
      //       ); // Dynamic max length
      //       var minWidthEm = Math.min((dynamicLength / maxLength) * 30, 30); // Cap at 30em
      //       oMessageVBox.setWidth(minWidthEm + "em");

      //       oMessageVBox.addItem(
      //         new Text({
      //           text: message.message,
      //         }).addStyleClass("messageText")
      //       );

      //       if (message.side === "left") {
      //         // For left: Icon first, then margin, then message
      //         oMessageBox.addItem(
      //           new Image({
      //             src: message.icon,
      //             width: "30px",
      //             height: "30px",
      //           }).addStyleClass("messageIcon")
      //         );
      //         oMessageBox.addItem(
      //           new HBox({
      //             width: "10px", // Basic margin
      //           })
      //         );
      //         oMessageBox.addItem(oMessageVBox);
      //       } else {
      //         // For right: Message first, then margin, then icon
      //         oMessageBox.addItem(oMessageVBox);
      //         oMessageBox.addItem(
      //           new HBox({
      //             width: "10px", // Basic margin
      //           })
      //         );
      //         oMessageBox.addItem(
      //           new Image({
      //             src: message.icon,
      //             width: "30px",
      //             height: "30px",
      //           }).addStyleClass("messageIcon")
      //         );
      //       }

      //       // Add the HBox to the chat list
      //       oChatList.addItem(oMessageBox);
      //     }.bind(this)
      //   ); // Bind 'this' to access the messages array
      // },

      // onSendMessage: function (oEvent) {
      //   // Example function to handle sending a new message (triggered by a button or input)
      //   var newMessageText =
      //     "New message from bot at " + new Date().toLocaleTimeString(); // Example dynamic text
      //   var newMessage = {
      //     message: newMessageText,
      //     side: "left", // New messages go to left (bot)
      //     icon: "../Images/copilot.png",
      //   };

      //   // Add the new message to the array
      //   this.messages.push(newMessage);

      //   // Re-run testChat to update the UI with the new message
      //   this.testChat();
      // },

      onInputChange: function (oEvent) {
        // Get the input control
        var oInput = oEvent.getSource();
        // Get the current value of the input
        var sValue = oInput.getValue();
        // Get the send button by ID
        var oSendButton = this.byId("sendButton");

        // Toggle visibility based on whether the input has text
        oSendButton.setVisible(!!sValue.trim());
      },

      testChat: function () {
            var oChatList = this.byId("chatList");
            oChatList.destroyItems(); // Clear existing items to avoid duplicates
            var aMessages = this.oMessageModel.getProperty("/messages");
            aMessages.forEach(
                function (message) {
                    var oMessageBox = new HBox({
                        alignItems: "Center",
                        wrap: "Wrap"
                    }).addStyleClass(
                        message.side === "left" ? "leftMessage" : "rightMessage"
                    );

                    var oMessageVBox = new VBox({
                        alignItems: "Center"
                    }).addStyleClass("messageBox");

                    // Dynamic width calculation based on message length
                    var messageLength = message.message ? message.message.length : 10; // Fallback for loading/typing
                    var dynamicLength = messageLength;
                    if (message.typing && message.expectedLength) {
                        dynamicLength = message.expectedLength; // Use final expected length during typing for max width from start
                    }
                    var minWidthEm = 10; // Minimum width
                    var maxWidthEm = 40; // Maximum width
                    var widthEm;
                    if (message.loading) {
                        widthEm = 15; // Fixed for loading
                    } else {
                        // Linear scaling: map length to 10-40em (assuming 100 chars for full scale)
                        widthEm = minWidthEm + (maxWidthEm - minWidthEm) * Math.min(dynamicLength / 100, 1);
                        widthEm = Math.round(widthEm * 10) / 10; // Round to 1 decimal
                    }
                    oMessageVBox.setWidth(widthEm + "em");

                    // Handle loading state, typing state, or regular message
                    if (message.loading) {
                        oMessageVBox.addItem(
                            new Text({
                                text: "Thinking"
                            }).addStyleClass("loadingAnimation")
                        );
                    } else if (message.typing) {
                        oMessageVBox.addItem(
                            new Text({
                                text: message.message
                            }).addStyleClass("typingAnimation")
                        );
                    } else {
                        oMessageVBox.addItem(
                            new Text({
                                text: message.message
                            }).addStyleClass("messageText")
                        );
                    }

                    if (message.side === "left") {
                        // For left: Icon first, then margin, then message
                        oMessageBox.addItem(
                            new Image({
                                src: message.icon || "Images/default.png", // Fallback image
                                width: "30px",
                                height: "30px"
                            }).addStyleClass("messageIcon")
                        );
                        oMessageBox.addItem(
                            new HBox({
                                width: "10px"
                            })
                        );
                        oMessageBox.addItem(oMessageVBox);
                    } else {
                        // For right: Message first, then margin, then icon
                        oMessageBox.addItem(oMessageVBox);
                        oMessageBox.addItem(
                            new HBox({
                                width: "10px"
                            })
                        );
                        oMessageBox.addItem(
                            new Image({
                                src: message.icon || "Images/chat-bot.png", // Adjusted path
                                width: "30px",
                                height: "30px"
                            }).addStyleClass("messageIcon")
                        );
                    }

                    // Add the HBox to the chat list
                    oChatList.addItem(oMessageBox);
                }.bind(this)
            );

            // Auto-scroll to the top after rendering
            if (!this.isScrolling) {
                var oScrollContainer = this.byId("chatContainer");
                var that = this;
                setTimeout(function () {
                    oScrollContainer.scrollTo(0, 0, 0); // Scroll to top
                }, 50); // Delay to ensure UI update
            }
        },

        displayTypingEffect: function (sResponse) {
            var that = this;
            var aMessages = this.oMessageModel.getProperty("/messages");
            var words = sResponse.split(" ");
            var currentWordIndex = 0;
            var currentText = "";

            // Hide send button, show stop button during typing
            this.byId("sendButton").setVisible(false);
            this.byId("stopButton").setVisible(true);

            // Remove the loading message
            var loadingIndex = aMessages.findIndex(msg => msg.loading === true);
            if (loadingIndex !== -1) {
                aMessages.splice(loadingIndex, 1);
            }

            // Add a temporary typing message with expectedLength for max width from start
            aMessages.push({
                message: "",
                side: "left",
                icon: "Images/copilot.png",
                typing: true,
                expectedLength: sResponse.length  // Pre-calculate final length for width
            });
            this.oMessageModel.setProperty("/messages", aMessages);
            this.testChat();

            // Simulate typing by adding words one by one
            this.typingInterval = setInterval(function () {
                if (currentWordIndex < words.length) {
                    currentText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
                    aMessages[aMessages.length - 1].message = currentText;
                    that.oMessageModel.setProperty("/messages", aMessages);
                    that.testChat();
                    currentWordIndex++;
                } else {
                    // Typing complete, remove typing flag and expectedLength, update model
                    clearInterval(that.typingInterval);
                    that.typingInterval = null;
                    aMessages[aMessages.length - 1] = {
                        message: sResponse,
                        side: "left",
                        icon: "Images/copilot.png"
                    };
                    that.oMessageModel.setProperty("/messages", aMessages);
                    that.testChat();

                    // Reset buttons after complete
                    that.byId("sendButton").setVisible(true);  // Or manage via onInputChange if needed
                    that.byId("stopButton").setVisible(false);
                }
            }, 100); // 100ms per word for typing speed
        },

        onStopPress: function () {
            if (this.typingInterval) {
                clearInterval(this.typingInterval);
                this.typingInterval = null;
            }

            var aMessages = this.oMessageModel.getProperty("/messages");
            var typingIndex = aMessages.findIndex(msg => msg.typing === true);
            if (typingIndex !== -1) {
                aMessages[typingIndex].message += " (Stopped)";  // Append to partial text
                delete aMessages[typingIndex].typing;
                delete aMessages[typingIndex].expectedLength;
                this.oMessageModel.setProperty("/messages", aMessages);
                this.testChat();
            }

            // Reset buttons after stop
            this.byId("sendButton").setVisible(true);  // Or manage via onInputChange
            this.byId("stopButton").setVisible(false);
        },

        onSendPress: function () {
            var oInput = this.byId("messageInput");
            var sUserMessage = oInput.getValue().trim();

            if (!sUserMessage) {
                MessageToast.show("Please enter a message.");
                return;
            }

            // Add user message to the model
            var aMessages = this.oMessageModel.getProperty("/messages");
            aMessages.push({
                message: sUserMessage,
                side: "right",
                icon: "Images/user.png" // Adjusted path
            });
            this.oMessageModel.setProperty("/messages", aMessages);

            // Clear input field
            oInput.setValue("");

            // Re-render chat to show user message immediately
            this.testChat();

            // Add placeholder loading message
            aMessages.push({
                message: "",
                side: "left",
                icon: "Images/copilot.png", // Adjusted path
                loading: true
            });
            this.oMessageModel.setProperty("/messages", aMessages);

            // Re-render chat to show loading HBox
            this.testChat();

            // Call API for response
            var that = this;
            jQuery.ajax({
                url: "https://aisp-odata-agent.cfapps.ap10.hana.ondemand.com/get_response/",
                type: "POST",
                contentType: "application/json",
                accept: "application/json",
                data: JSON.stringify({ question: sUserMessage }),
                success: function (oData) {
                    var sBotResponse = oData.success && oData.success.message 
                        ? oData.success.message 
                        : "Sorry, I couldn't process your request.";
                    that.displayTypingEffect(sBotResponse);
                },
                error: function (oError) {
                    that.displayTypingEffect("Sorry, there was an error. Please try again.");
                    MessageToast.show("Error communicating with the backend.");
                    console.error(oError);
                }
            });
        },
    });
  }
);

//
//============== DATA CONTROLLER ===============
//
var DataController = (function () {

    class Device {

        constructor(id, name, power, time, amount, kwhPrice, costDaily) {

            this.id = id;
            this.name = name;
            this.power = power;
            this.time = time;
            this.amount = amount;
            this.kwhPrice = kwhPrice;
            this.costDaily = costDaily;

        }

        calcDailyCost() {

            this.costDaily = (this.power * this.time / 1000) * this.kwhPrice;

        };

    };

    var devices = [];

    var costDailyAll = function () {

        var sum = 0;

        devices.forEach(d => {

            sum += d.costDaily;

        });

        return sum;

    };

    var formatNumbers = function () {



    };

    return {

        addNewDevice: function (name, power, time, amount, kwhPrice) {

            var id;

            if (devices.length > 0) {
                id = devices[devices.length - 1].id + 1;
            } else {
                id = 1;
            }

            var newDevice = new Device(id, name, power, time, amount, kwhPrice);

            newDevice.calcDailyCost();

            devices.push(newDevice);

            return newDevice;
        },

        deleteDevice: function (idDevice) {
            let arrIds, index;

            arrIds = devices.map(d => {
                return d.id;
            });

            index = arrIds.indexOf(parseInt(idDevice));

            devices.splice(index, 1);

        },

        getCosts: function () {

            let dailyCost = costDailyAll();

            return {

                daily: dailyCost,
                monthly: dailyCost * 30,
                yearly: dailyCost * 365

            };

        },

        getDevices: function () {
            return devices;
        }

    }

})();

//
//============== UI CONTROLLER ===============
//

var UIController = (function () {

    var DOM = {

        inputName: ".add_desc",
        inputPower: ".add_power",
        inputTime: ".add_time",
        inputAmount: ".add_amount",
        addBtn: ".add__btn",
        delBtn: ".del__btn",
        deviceList: ".device-list-box",
        listBox: ".list-box",
        kwhPrice: ".input-pricekwh",
        daily: ".daily",
        monthly: ".monthly",
        yearly: ".yearly",
        colNames: ".col-names",
        notFilledInputBorder: "1px solid #e74c3c",
        row: ".row",
        header: "header"

    };

    return {

        // make possible to get device data from UI
        getInput: function () {

            return [

            document.querySelector(DOM.inputName).value,

             document.querySelector(DOM.inputPower).value,

             document.querySelector(DOM.inputTime).value,

             document.querySelector(DOM.inputAmount).value

            ];

        },

        insertListDevice: function (device) {

            var html, newHtml;

            html = '<div class="device animated slideInUp" id="%id%"><div class="dev name text">%name%</div><div class="dev cost text">%cost%</div><div class="dev power text">%power%</div><div class="dev time text">%time%</div><div class="dev amount text">%amount%</div><button class="del__btn"><i class="ion-close-circled"></i></button></div>';

            let costMonthly = device.costDaily * 30;

            newHtml = html.replace("%id%", device.id);
            newHtml = newHtml.replace("%name%", device.name);
            newHtml = newHtml.replace("%cost%", costMonthly.toFixed(2));
            newHtml = newHtml.replace("%power%", device.power);
            newHtml = newHtml.replace("%time%", device.time);
            newHtml = newHtml.replace("%amount%", device.amount);

            document.querySelector(DOM.deviceList).insertAdjacentHTML("beforeend", newHtml);


        },

        deleteListDevice: function (id) {

            var el = document.getElementById(id);
            el.parentNode.removeChild(el);

        },

        getDOM: function () {
            return DOM;
        },

        getKwhPrice: function () {
            return document.querySelector(DOM.kwhPrice).value;
        },

        updateTotal: function (cost) {

            document.querySelector(DOM.daily).textContent = cost.daily.toFixed(2) + " zł";

            document.querySelector(DOM.monthly).textContent = cost.monthly.toFixed(2) + " zł";

            document.querySelector(DOM.yearly).textContent = cost.yearly.toFixed(2) + " zł";

        },

        showColNames: function () {

            let html = '<div class="list-box"><div class="device-list-box"><div class="col-names animated slideInUp"><div class="col name text">Nazwa</div><div class="col cost text">Koszt [zł]/mc</div><div class="col power text">Moc [W]</div><div class="col time text">Czas [h]/dzień</div><div class="col amount text">Ilość</div></div></div></div>';
            document.querySelector(DOM.row).insertAdjacentHTML("beforeend", html);

        },
        
        hideColNames: function () {
          
            let el = document.querySelector(DOM.listBox);
            el.parentNode.removeChild(el);
            
        },

        askToFillInputs: function (input) {

            for (var el in input) {

                if (input[el] === "") {

                    switch (parseInt(el)) {

                        case 0:
                            document.querySelector(DOM.inputName).style.border = DOM.notFilledInputBorder;
                            break;

                        case 1:
                            document.querySelector(DOM.inputPower).style.border = DOM.notFilledInputBorder;
                            break;

                        case 2:
                            document.querySelector(DOM.inputTime).style.border = DOM.notFilledInputBorder;
                            break;

                        case 3:
                            document.querySelector(DOM.inputAmount).style.border = DOM.notFilledInputBorder;
                            break;

                        default:
                            console.log("Wrong arr in switch statement, no case matched");

                    }
                }

            };

        },

        clearInputBorders: function () {

            document.querySelector(DOM.inputName).style.border = "0px";
            document.querySelector(DOM.inputPower).style.border = "0px";
            document.querySelector(DOM.inputTime).style.border = "0px";
            document.querySelector(DOM.inputAmount).style.border = "0px";
        },

        clearInputFields: function () {

            document.querySelector(DOM.inputName).value = "";
            document.querySelector(DOM.inputPower).value = "";
            document.querySelector(DOM.inputTime).value = "";
            document.querySelector(DOM.inputAmount).value = "";
        },

    }


})();



//
//============== APP CONTROLLER ===============
//
var AppController = (function (UICtrl, DataCtrl) {

    var DOMstrings = UICtrl.getDOM();

    //Set up all the events related to clicks and any other user interaction
    var SetupEventListeners = function () {

        //add new device button event
        document.querySelector(DOMstrings.addBtn).addEventListener("click", addDevice);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode == "13" || event.which == "13")
                addDevice();
        });

    };

    var addDevice = function () {

        let newInput, newDevice, kwhPrice, devices;

        newInput = UICtrl.getInput();

        if (verifyInput(newInput)) {

            // read the kwh price from the UI controller
            kwhPrice = UICtrl.getKwhPrice();

            //Add device to Data    
            newDevice = DataCtrl.addNewDevice(...newInput, kwhPrice);

            //Update UI
            updateUI(newDevice);


        } else {

            //Verify and ask to fill inputs
            UICtrl.clearInputBorders();
            UICtrl.askToFillInputs(newInput);

        }

    };

    var deleteDevice = function (event) {

        var id = event.target.parentNode.parentNode.id;

        //delete device in data
        DataCtrl.deleteDevice(id);
        //delete device in UI
        UICtrl.deleteListDevice(id);

        //Update the balance
        UICtrl.updateTotal(DataCtrl.getCosts());
        
        //Hide column names - will happen only if 1 left gone
        hideColNames();

    };
    
    
    var showColNames = function () {

        let devices = DataCtrl.getDevices();

        if (devices.length === 1) {
            UICtrl.showColNames();
            //add del device button event
            document.querySelector(DOMstrings.deviceList).addEventListener("click", deleteDevice);
        };

    };
    
    var hideColNames = function () {
        
        let devices = DataCtrl.getDevices();

        if (devices.length === 0) {
            
            UICtrl.hideColNames();
     
        };
        
    };

    var updateUI = function (newDevice) {

        //Update the balance
        UICtrl.updateTotal(DataCtrl.getCosts());

        //add column names
        showColNames();

        //Add device to UI
        UICtrl.insertListDevice(newDevice);

        //clear borders for empty fields and clear input fields
        UICtrl.clearInputBorders();
        UICtrl.clearInputFields();

    };

    var verifyInput = function (newInput) {

        if (newInput[0] != "" && newInput[1] != "" && newInput[2] != "" && newInput[3] != "") {
            return true;
        }

    };

    return {

        init: function () {

            console.log("Application started !");

            SetupEventListeners();

        }

    }



})(UIController, DataController);


AppController.init();

//controls the inside datastructure

var budgetController = (function() {

    var Expense = function(id ,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };
    Expense.prototype.calcpercentage = function(totalIncome){

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        }else{
            this.percentage = -1
        }
        
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

    var Income = function(id ,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
       allItems: {
           exp:[],
           inc:[]
       },

       totals:{
           exp: 0,
           inc: 0
       },
       budget: 0,
       percentage: -1
    };
    
    return{
        addItem: function(type, des, val){
            var newItem , ID;
           
           
            //create new id
            if(data.allItems[type].length > 0){
                var lastIndex = data.allItems[type].length-1;
            ID = data.allItems[type][lastIndex].id + 1;

            }else {
                ID = 0;
            }
            
            //check type 
            if(type === 'inc'){
                newItem = new Income(ID,des,val)

            }else if(type === 'exp'){
                newItem = new Expense(ID,des,val)
            }

            //push item
            data.allItems[type].push(newItem);
            data.totals[type] += parseFloat(val);
            return newItem;
            
        },

        deleteItem: function(type,id){
            var ids,index, val;
            // return the array index having this id

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            val = data.allItems[type][index].value;
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
                data.totals[type] -= val;
            }


        },


        calculateBudget: function(){
           
            data.budget = data.totals['inc'] - data.totals['exp'];

            if(data.totals['inc'] > 0){
            data.percentage = Math.round((data.totals['exp'] / data.totals['inc']) * 100);
        }else{
            data.percentage = -1;
        }

        },

        getBudget: function(){
            return{
                budget: data.budget,
                income: data.totals['inc'],
                expense: data.totals['exp'],
                percentage: data.percentage
            }
        },

        calculatePercentages: function(){
        
            data.allItems.exp.forEach(function(current){
                current.calcpercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            
            var allPers = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPers;



        },



        testing : function(){
            console.log(data);
            console.log(data.allItems['inc'][0].value);
        }
    };


})();











//controls the UI
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expensePercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    var formatNumber =  function(num,type){
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;



    }

    return{
        getInput: function() {
            return {


                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value, 
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem : function(obj,type){

            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);     

        },

        deleteListItem: function(selectorID) {
            
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
            
        },

        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray =Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index , array){
                current.value = "";

            });
            fieldsArray[0].focus();

        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(DOMstrings.expenseValue).textContent = formatNumber(obj.expense, 'exp');

            if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentage).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMstrings.percentage).textContent = "---";
            }

        },


        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensePercentage);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
           
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },




        getDOMstrings: function() {
            return DOMstrings;
        },



    };




})();













// interface between thee other two controllers
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListners = function(){
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.addButton).addEventListener('click',  controlAddItem);

        document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){
            controlAddItem();
        }
    });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    
    };

  

    var updateBudget = function(){

        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();
       
        UICtrl.displayBudget(budget);


    }

    var updatePercentages = function(){
        
        budgetCtrl.calculatePercentages();
        console.log("1");

        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
       
        UICtrl.displayPercentages(percentages);


    }

    var controlAddItem = function(){


        var input, newItem;
        
        input = UICtrl.getInput();
        console.log(input);

        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);
    
            UICtrl.clearFields();
    
            updateBudget();

            updatePercentages();
        }

      

    }

    var ctrlDeleteItem = function(event){
        var itemID,splitID, type, ID;

       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

       if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type,ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
           
       }

    };

    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expense: 0,
                percentage: -1
            });
            setupEventListners();

        }
    };

})(budgetController , UIController);

controller.init();


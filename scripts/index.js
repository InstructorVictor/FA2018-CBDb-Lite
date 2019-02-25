// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
// Note: all JavaScript in an Immediately Invoked Function Expression:   (function(){})();
// Note: all app code must be in the onDeviceReady() function
(function () {
    "use strict";

    // Cordova waiting to be loaded into memory, and when when it is, our app is ready
    document.addEventListener("deviceready", onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener("pause", onPause.bind( this ), false );
        document.addEventListener("resume", onResume.bind(this), false);
        // Capture the Back button and stop it from exiting the app
        document.addEventListener("backbutton", function (event) { onBackKeyDown(event); });
        
        console.log("Device ready!");
        // After Cordova is loaded into memory, hide the Splashscreen
        // Requires Cordova Splashscreen plugin in the Core section of config.xml
        navigator.splashscreen.hide();

        /* ===== Variables ===== */
        // Create variables for our Forms
        var $elFormSignUp = $("#formSignUp"),
            $elFormLogIn = $("#formLogIn");
        // Create Variables for the jQM Popups
        var $elPopErrorSignUpMismatch = $("#popErrorSignUpMismatch"),
            $elPopErrorSignUpExists = $("#popErrorSignUpExists"),
            $elPopErrorSignUpWeak = $("#popErrorSignUpWeak"),
            $elPopSuccessSignUpWelcome = $("#popSuccessSignUpWelcome"),
            $elPopErrorLogInNotExists = $("#popErrorLogInNotExists"),
            $elPopErrorLogInWrongPassword = $("#popErrorLogInWrongPassword"),
            $elPopErrorLogInTooMany = $("#popErrorLogInTooMany");
        // Create Variables dealing with Classes
        // In this case this Variable (Object) stores a reference to ALL instances of
        // any HTML Elements (Nodes) with the unique Class Attribute of "userEmail"
        var $elUserEmail = $(".userEmail");
        // Create Variables for "plain old buttons"
        var $elBtnLogOut = $("#btnLogOut");
        // Variable to store the email of who is currently logged in
        var uid = localStorage.getItem("whoIsLogged");
        // Uninitialized Variable to store a PouchDB database for each user
        var db;
        // PouchDB Variables for working with comics
        var $elFormSaveComic = $("#formSaveComic");
        // Variable for the Delete Collection button to delete collection
        var $elBtnDeleteCollection = $("#btnDeleteCollection");
        // Object representing the <div> in index.html to display comics
        var $elDivShowComicsTable = $("#divShowComicsTable");
        // Objects for Delete and Edit comic
        var $btnDeleteComic = $("#btnDeleteComic"),
            $btnEditComic   = $("#btnEditComic");
        // Object to keep track of the current comic (to delete)
        // Currently undefined until we click on a Comic
        // FYI no $ because not created via jQuery
        var tmpComicToDelete;
        // Objects for Submitting an update to a comic and canceling updating a comic
        var $elFormEditComicsInfo  = $("#formEditComicsInfo"),
            $elBtnEditComicsCancel = $("#btnEditComicsCancel");
        // Object for Scanning a Barcode and Taking Photo
        var $elBtnScanBarcode = $("#btnScanBarcode");
        var $elBtnTakePhoto = $("#btnTakePhoto"); 
        // Objects for sending developer an email and connecting to social media
        var $elBtnEmail = $("#btnEmail"),
            $elBtnShare = $("#btnShare");

        // Reusable function to initizliaze a database based on who's logged in
        function initDB() {
            console.log("initDB() is running");
            /*
                Every user has their own Database, named after their email.
                It's based on the currenlty-logged in user (whoIsLogged).
                So, first get that email and store it in a Var,
                then use it to create (or connect to) their database
                and return the Local Scope object back to Global Scope
            */
            var currentDB = localStorage.getItem("whoIsLogged");
            db = new PouchDB(currentDB);
            return db;
        } // END initDB()

        /*
            A system to check if a person is logged in or not.
            If they are previously logged in, move them from pgWelcome to pgHome.
            If not, keep them at pgWelcome
            The following is NOT in a Function because we want it to run as soon as the app
                is loaded in memory. 
            Using a Conditional Statement, we can determine if the person is logged in or not
                and then move them to where they need to be
            To be safe we checked three things: is the cookie empty "" OR is it null OR undefined? 
        */
        if (uid === "" ||
            uid === null ||
            uid === undefined) {
            console.log("No User is logged in. Stay at pgWelcome");
            // Keep them here. Else Code Block does not run. 
        } else {
            console.log("A User IS logged in. Move them to pgHome");
            initDB();               // Initialize Database
            fnShowComicsPrep();     // Redraw the table of comics
            $elUserEmail.html(uid); // Write the User's email to Footer
            $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
        } // END If..Else to check if User is logged in or not

        /* ===== Functions ===== */
        // The Function that runs when we submit the formSignUp Form
        // which does many things (collect name, confirm password, etc)
        // We will need to override the default behavior of a Form
        // submitted on a web server. We pass in the event Argument
        // so that we can prevent the default behavior of refresh
        // Global Scope Variables exist at all times in memory and
        // can be access by every Function in your program
        function fnSignUp(event) {
            console.log("fnSignUp() is running");
            event.preventDefault();
            // Create Local Scope Variables that represent the <input> Fields
            // Local Scope Variables are those created in a Function
            // AND CAN ONLY BE USED IN THAT FUNCTION
            // One reason to use Local Scope is because they only exist in
            // memory as long as they are needed (as long as the function is running)
            /*
                Via jQuery we created three Variables that store a 
                reference to each of those <input> Fields.
                var elInEmailSignUp = document.getElementById("inEmailSignUp").value;
            */
            var $elInEmailSignUp = $("#inEmailSignUp"),
                $elInPasswordSignUp = $("#inPasswordSignUp"),
                $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");

            // Display the value of what they typed into the <input> fields, via the .val() JQ Method
            console.log("Their email is: " + $elInEmailSignUp.val());
            console.log("Their password is: " + $elInPasswordSignUp.val());
            console.log("Their confirmation is: " + $elInPasswordConfirmSignUp.val());

            /*
                New If Else to check password validity: 
                Length of at least 7 characters 
                    and Numbers
                    and Letters
                    and Symbols
            */
            /*
                https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
                Example Js code to use Regular Expressions to check for a Strong Password
            */
            var strongPasword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})");
            if (strongPasword.test($elInPasswordSignUp.val())) {
                console.log("Password is valid");
                /*
                    Using Conditional Statements, we can program the app to "make decisions." 
                    The If..Else paradigm allows us to create a Yes or No type of decision:
                        Does the User exist in our system, or not? 
                    Also, we need a Conditional Statement to confirm that passwords match.
                    We are checking if the original password DOES NOT match the confirmed password
                */
                if ($elInPasswordSignUp.val() !== $elInPasswordConfirmSignUp.val()) {
                    // If the Condition is TRUE, do the code in this block
                    console.log("Password DON'T match!");
                    // Activate the JQM popups after the user interacts
                    $elPopErrorSignUpMismatch.popup();
                    $elPopErrorSignUpMismatch.popup("open", { "transition": "flip" });
                    // Clear both Password fields so they may try again
                    // Using .val() Method we can read or write to an Input field
                    $elInPasswordSignUp.val("");
                    $elInPasswordConfirmSignUp.val("");
                } else {
                    // Or else, the Condition is FALSE, so do the code in THIS block
                    console.log("Password DO MATCH!");
                    // Testing how to save data with localStore
                    // .setItem() takes the name of the "Cookie" as the parameter
                    // and then, comma, the data (as a String)
                    // localStorage.setItem("testcookie1", "Hello, world!");

                    // Store temporary copies of the email and password they entered
                    // converted to UPPERCASE to avoid issues with lowercase vs uppercase
                    // Note: password is also converted to UC, but you don't have to...
                    var tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                        tmpValInPasswordSignUp = $elInPasswordSignUp.val();

                    /*
                        Another Conditional Statement to check if the user exists, or not. 
                        This will work by checking the localStorage Object named for their email
                        If localStorage DOES NOT have data saved in that cookie, they are  new user;
                        If localStorage *DOES* have data saved in that cookie, they are a returning user
                        =     Assignment      - "Take the thing on the right and put it into the thing at left"
                            cat = "cute";
                        ==    Comparison 	    - "Check if the thing at left is the same as the thing at right"
                                1 == "1"   Probably true
                        ===	  Strict Comparion  -"Check if the thing at left is the same as the thing at right AND their Data Types Match"
                                1 === "1"  Always false
                                "null" === null    FALSE
                    */
                    if (localStorage.getItem(tmpValInEmailSignUp) === null) {
                        // User does not exist
                        console.log("This user does not exist");
                        // We save the User's email and password in localStorage
                        localStorage.setItem(tmpValInEmailSignUp, tmpValInPasswordSignUp);
                        console.log("New user saved: " + tmpValInEmailSignUp);
                        // Then reset the whole form, another user can create account
                        $elFormSignUp[0].reset();
                        $elPopSuccessSignUpWelcome.popup();
                        $elPopSuccessSignUpWelcome.popup("open", { "transition": "slideup" });
                    } else {
                        // User DOES exist, so show them an error popup about it
                        console.log("This user DOES exist");
                        $elPopErrorSignUpExists.popup();
                        $elPopErrorSignUpExists.popup("open", { "transition": "flip" });
                    } // END If..Else for checking if User exists
                } // END If..Else for checking if Passwords match
            } else {
                console.log("Password IS NOT valid");
                $elPopErrorSignUpWeak.popup();
                $elPopErrorSignUpWeak.popup("open", { "transition": "flip" });
            } // END If...Else checking password validity
        } // END fnSignUp()

        // Function to deal with User logging in
        // Takes the event Parameter to prevent a refresh behavior
        function fnLogIn(event) {
            console.log("fnLogIn() is running");
            event.preventDefault();

            var $elInEmailLogIn = $("#inEmailLogIn"),
                $elInPasswordLogIn = $("#inPasswordLogIn"),
                tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
                tmpValInPasswordLogIn = $elInPasswordLogIn.val();

            console.log("About to log in with this Email: " + tmpValInEmailLogIn);
            console.log("About to log in with this Password: " + tmpValInPasswordLogIn);

            // If..Else to check if User exists in the system (localStorage
            // and then if the input password matches the stored password
            if (localStorage.getItem(tmpValInEmailLogIn) === null) {
                console.log("User does not exist in localStorage");
                $elPopErrorLogInNotExists.popup();
                $elPopErrorLogInNotExists.popup("open", { "transition": "flip" });
            } else {
                console.log("User DOES exist in localStorage");
                // If..Else to check if password input matches password stored
                if (tmpValInPasswordLogIn === localStorage.getItem(tmpValInEmailLogIn)) {
                    console.log("Passwords DO match!");
                    $elUserEmail.html(tmpValInEmailLogIn.toLowerCase());

                    // jQM code to move from the current screen (<section>) to another
                    // Move us from #pgLogIn to #pgHome
                    // Selecting the current screen, use pagecontainer Method, change to another
                    // screen and animate it with flip
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgHome", { "transition": "flip" });
                    // Save in Local Storage the last person to sign in
                    localStorage.setItem("whoIsLogged", tmpValInEmailLogIn);
                    // After a user logs in, create/connect to their database
                    initDB();
                    // Then refresh the table with their comics:
                    fnShowComicsPrep();
                } else {
                    console.log("Passwords do not match!");
                    $elPopErrorLogInWrongPassword.popup();
                    $elPopErrorLogInWrongPassword.popup("open", { "transition": "flip" });
                    $elInPasswordLogIn.val("");
                } // END If..Else checking if passwords match
            } // END If..Else checking if user exists in localStorage
        } // END fnLogIn()

        // Function to deal with User logging out
        function fnLogOut() {
            console.log("fnLogOut is running");
            /* Conditional Statement to confirm if the user really wants to log out
                Introduction the Switch Conditional Statement	
                This checks from a list of known possibilities before making a decision
                or, goes to the "default" if all else fails choice
                Using the built-in .confirm() Method, we can ask a question
                with two possible responses: true or false
                Our Switch waits for their interaction, then captures true/false
                then deals with it. 
                Pro tip: try putting the most common possibility first
            */
            switch (window.confirm("Are you sure you want to log out?")) {
                case true:
                    console.log("They DO want to log out");
                    // Clear the Log In form of the last User that logged in
                    $elFormLogIn[0].reset();
                    // Mark that the current user logged out
                    localStorage.setItem("whoIsLogged", "");
                    // To-do: Save any unsaved comic data
                    // Then move from the current screen to the Welcome screen
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome", { "transition": "slidedown" });
                    break;
                case false:
                    console.log("They DO NOT want to log out");
                    break;
                case "maybe":
                    console.log("They might want to want to log out");
                    break;
                default:
                    console.log("We don't know what they want");
                    break;
            } // END Switch to confirm logging out
        } // END fnLogOut()

        // Function to check the first word of a Comic name
        // This Function takes an Argument: the title in question (str)
        function fnGetFirstWord(str) {
            console.log("fnGetGetFirstWord(str) is running");

            // The Amazing Spider-Man
            // A Journey to Adventure
            // Spider-Man
            // Mystery Men
            // Conditional Statement to check if the title is a 
            // One-word title or not
            if (str.indexOf(" ") === -1) {
                // It found no empty space
                console.log("A one-word title");
                // Return the Title, as-is
                return str;
            } else {
                // It found one empty space
                console.log("A multi-word title");
                // Return ONLY the first word of the Title
                // .substr() will return part of the String, 
                // starting at position 0, and going until the first instance
                // of an empty space (INCLUSIVE)
                return str.substr(0, str.indexOf(" "));
            }
        } // END fnGetFirstWord(str)

        // Function to prepare the Comic data before passing to fnSaveComic()
        function fnPrepComic() {
            console.log("fnPrepComic() is running");

            // Variables that store all the Input fields
            var $valInTitle = $("#inTitle").val(),
                $valInNumber = Number($("#inNumber").val()),
                $valInYear = Number($("#inYear").val()),
                $valInPublisher = $("#inPublisher").val(),
                $valInNotes = $("#inNotes").val(),
                $valInBarcode = $("#inBarcode").val(),
                $valInPhoto = $("#inPhoto").val();

            // Temporary version of the Title of the Comic
            // tmpID1 is the Uppercase version of only the first word of the Comic
            // tmpID2 is the Uppercase version of the whole name of the Comic
            // tmpID3 will be the name of the Comic without the first word (reserved word)
            var tmpID1 = fnGetFirstWord($valInTitle.toUpperCase()),
                tmpID2 = $valInTitle.toUpperCase(),
                tmpID3 = "";

            // Switch Conditional Statement to determine the reserved word
            // and remove it, if necessary
            switch (tmpID1) {
                case "THE":
                    console.log("Title has a THE");
                    // 1. Update the temp Title w/o the word "the" and the empty space
                    // 2. Then only keep the first three letters of the cleaned up Title
                    // THE AMAZING SPIDER-MAN
                    tmpID3 = tmpID2.replace("THE ", ""); //AMAZING SPIDER-MAN
                    //tmpID3 = tmpID3.substr(0, 3); // AMA
                    console.log(tmpID3);
                    // Reason for this
                    // "_id" : THEAMAZINGSPIDERMAN11963
                    // "_id" : AMAZINGSPIDERMAN11963
                    // "_id" : AMA11963
                    // Amazing Spider-Man       Amazing Fantasy
                    break;
                case "A":
                    console.log("Title has an A");
                    tmpID3 = tmpID2.replace("A ", ""); //AMAZING SPIDER-MAN
                    //tmpID3 = tmpID3.substr(0, 3); // AMA
                    console.log(tmpID3);
                    break;
                case "AN":
                    console.log("Title has a AN");
                    tmpID3 = tmpID2.replace("AN ", ""); //AMAZING SPIDER-MAN
                    //tmpID3 = tmpID3.substr(0, 3); // AMA
                    console.log(tmpID3);
                    break;
                default:
                    console.log("Title does not a reserved word");
                    // NOTE: .substr() from **tmpID2**, the unaltered version
                    //tmpID3 = tmpID2.substr(0, 3);
                    tmpID3 = tmpID2;
                    console.log(tmpID3);
                    break;
            } // END switch checking reserved word

            // Now bundle the data together to pass into fnSaveComic()
            // "_id" : tmpID3 + $valInNumber + $valInYear   = AMA11963
            // "_id": tmpID2 + $valInNumber + $valInYear    = AMAZINGSPIDER-MAN11963
            // If we did NOT want non-alphanumeric characters... 
            // "/"  starts the Regular Expression
            // "\W" all non-alpha characters
            // "/g" globally, to all instances
            // $valInTitle.replace(/\W/g, "")
            // "_id": tmpID2.replace(/\W/g, "") + $valInNumber + $valInYear,
            // We switched to Title + Year + Number for better organization
            // We switched to a version of the Title without the Article (The/A/An)
            var tmpComic = {
                "_id": tmpID3.replace(/\W/g, "") + $valInYear + $valInNumber,
                "title": $valInTitle,
                "number": $valInNumber,
                "year": $valInYear,
                "publisher": $valInPublisher,
                "notes": $valInNotes,
                "barcode": $valInBarcode,
                "photo": $valInPhoto
            };

            console.log(tmpComic);

            return tmpComic;
        } // END fnPrepComic()

        // Function to save a comic
        function fnSaveComic(event) {
            console.log("fnSaveComic() is running");
            event.preventDefault();

            // Create a LS Variable that is the result of running fnPrepComic()
            var aComic = fnPrepComic();

            // Using Pouch's  .put() Method will store the data in the Database
            // Almost every PouchDB Method (command) returns a Failure or Success result
            // It is an Object, in JSON format that we can use
            // Basic syntax is db.SOMETHING(Object, function(failure, success){ moreCode(); })

            db.put(aComic, function (failure, success) {
                if (failure) {
                    console.log("Failed to save data because: " + failure);
                    // Condtional Statement to deal with Error Codes
                    switch (failure.status) {
                        case 400:
                            console.log("Data must be in JSON format");
                            break;
                        case 409:
                            console.log("_id already in use: " + aComic._id);
                            window.alert("You've already saved this comic!");
                            break;
                        case 412:
                            console.log("_id is empty");
                            break;
                        default:
                            console.log("Unknown error: " + failure.status);
                            break;
                    } // END switch() dealing with Error Codes
                } else {
                    console.log("Data saved, and " + success);
                    // After saving, clear the form
                    $elFormSaveComic[0].reset();
                    // Then show a popup to let the user know of success
                    // Note a variation on showing a popup
                    // This is without the Variable; a "quick and dirty" way
                    $("#popComicSaved").popup();
                    $("#popComicSaved").popup("open", { "transition": "slideup" });
                    // Refresh the Table to display the latest entry
                    fnShowComicsPrep();
                } // END If..Else checking Failure vs Success
            }); // END .put()
        } // END fnSaveComic()

        // Function to delete the PouchDB database
        function fnDeleteCollection() {
            console.log("fnDeleteCollection() is running");

            // Conditional Statement to confirm deletion of PouchDB
            switch (window.confirm("You are about to delete your whole collection. Confirm?")) {
                case true:
                    console.log("They wish to delete PouchDB");
                    // Second Conditional Statement to REALLY confirm delection
                    if (window.confirm("ARE YOU SURE?")) {
                        console.log("Second confirmation. DELETING POUCHDB");
                        // .destroy() deletes the PouchDB Db and gives back a
                        // success or failure object, like most PouchDB Methods
                        db.destroy(function (failure, success) {
                            if (failure) {
                                console.log("Failure to delete PouchDB " + failure);
                                window.alert("ERROR \nContact developer: dontcare@trashcan.org");
                            } else {
                                console.log("PouchDB was deleted " + success);
                                window.alert("Your mom threw out your comics successfully");
                                // Now that there is NO place in the system to save new comics,
                                // re-initialize a new, empty PouchDB Db
                                initDB();
                                fnShowComicsPrep(); // Redraw table
                            } // END If..Else for .destroy()
                        }); // END .destroy()
                    } else {
                        console.log("On second confirmation, backed out");
                    } // END If..Else for second confirmation
                    break;
                case false:
                    console.log("They DON'T want to delete PouchDB");
                    break;
                default:
                    console.log("Third  possibility?");
                    break;
            } // END switch() confirming deletion
        } // END fnDeleteCollection()

        // Function to prepare the data to be displayed on-screen
        function fnShowComicsPrep() {
            console.log("fnShowComicsPrep() is running");

            // Get all _id's of our data
            // We want all data of our data
            // We then will use Options to specifiy what we want
            // Note JSON syntax for our options
            // "ascending" : true - give me the data A-Z
            // "include_docs" : true - and give me all fields of a record
            db.allDocs({ "ascending": true, "include_docs": true },
                function (failure, success) {
                    if (failure) {
                        console.log("Error getting data: " + failure);
                    } else {
                        // console.log("Getting data: " + success.rows[0].doc.title);
                        // If..Else to check if there is data in PouchDB first, before displaying
                        if (success.rows[0] === undefined) {
                            console.log("No comics, yet, to display");
                            $elDivShowComicsTable.html("You have no comics, yet. Add some!");
                        } else {
                            // Pass this prepared data to the display function
                            fnShowComicsTable(success.rows);
                        } // END If..Else checking if any data in PouchDB
                    } // END If..Else .allDocs()
                }); // END .allDocs()
        } // END fnShowComicsPrep()

        // Just for testing, refresh table
        // But MUST be in fnLogIn() and If..Else checking whoIsLoggedIn
        // And in fnSaveComic()
        //fnShowComicsPrep();

        // Function that takes the PREPARED data from the database
        // and shows it on-screen
        // To get one comic db.get("SPIDERMAN19631")
        // To get a group of comics db.allDocs();
        // We should prepare our data before displaying on screen
        function fnShowComicsTable(data) {
            console.log("fnShowComicsTable is running");

            /*
                Display a Table with Rows for each comic
                A Column for the Title, and Number
                and an Icon for "View Details"
                then a pop-up with the details
            */

            // Start our Table; the first row
            var str = "<table> <tr> <th>Title</th> <th>#</th> <th>Details</th> </tr>";

            // Conditional Statement to do something several times
            // A For Loop lets you iterate x number of times
            // Start with Zeroth comic, loop as long as you have data (a length of data)
            // And increment (do it again) until then. Then stop.
            for (var i = 0; i < data.length; i++) {
                // Build our Table, row by row
                // data-xxxxxx is an HTML5 Attribute
                // WE can invent any data-whatever and populate it
                // with anything we want
                // In our case, set it to the _id of the comic in this row
                // When a user clicks any of the Speech Bubbles, JavaSCript will "know"
                // which comic we meant because of the _id associated with the row
                str += "<tr data-id='" + data[i].doc._id + "'> <td>" + data[i].doc.title + "</td> <td>" + data[i].doc.number + "</td> <td class='btnShowComicsInfo'>&#x1F4AC;</td> </tr>";
            } // END For Loop

            // End our Table. NOTE +=  to ADD to the Variable!!
            str += "</table>";

            $elDivShowComicsTable.html(str);
        } // END fnShowComicsTable()

        // Function to details of a comic in a pop-up screen
        function fnShowComicsInfo(thisComic) {
            console.log("fnShowComicsInfo() is running");
            console.log(thisComic);             // The whole <tr> full of data
            console.log(thisComic.data("id"));  // Only the data-id Attribute

            // Store the data-id of this row in a Variable
            var tmpComic = thisComic.data("id");

            // Keep track of the current comic so we know which to delete/edit
            tmpComicToDelete = tmpComic;

            // Retrieve all the Fields of the current comic to display on-screen
            db.get(tmpComic, function (failure, success) {
                if (failure) {
                    console.log("Couldn't show this comic: " + tmpComic + " " + failure);
                } else {
                    console.log("Showing comic: " + success.title);
                    // In the placeholder <div> in id="popViewComicsInfo", display data
                    // Note how we reference each p in sequence p:eq(x)
                    $("#divViewComicsInfo p:eq(0)").html("Name: " + success.title);
                    $("#divViewComicsInfo p:eq(1)").html("Number: " + success.number);
                    $("#divViewComicsInfo p:eq(2)").html("Year: " + success.year);
                    $("#divViewComicsInfo p:eq(3)").html("Publisher: " + success.publisher);
                    $("#divViewComicsInfo p:eq(4)").html("Notes: " + success.notes);
                    $("#divViewComicsInfo p:eq(5)").html("Barcode: " + success.barcode);
                    // Populating <img> src Attribute is different
                    // Using .attr() Method (of jQuery) we can read/write a particluar Attribute
                    $("#divViewComicsInfo p:eq(6) img").attr("src", success.photo);
                    // To-do: Picture
                } // END If..Else trying to .get()
            }); // END .get()

            // Display the Popup Info screen, after filling in the <p>
            $(":mobile-pagecontainer").pagecontainer("change", "#popViewComicsInfo", {"role":"dialog"});
        } // END fnShowComicsInfo()

        // Function to delete a single comic from the collection
        function fnDeleteComic() {
            console.log("fnDeleteComic is running");
            console.log("About to delete: " + tmpComicToDelete);

            // First check that the comic IS in the database
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("ERROR! Comic doesn't exist: " + failure);
                } else {
                    console.log("Confirming deletion of " + success);
                    // Confirmation from User to really delete
                    switch(window.confirm("About to delete this comic. \nAre you sure?")) {
                        case true:
                            console.log("Proceding delete!!");
                            // To remove ONE item from a PouchDB: .remove() Method
                            db.remove(success, function (failure, success) {
                                if (failure) {
                                    console.log("Could not delete this comic: " + failure);
                                } else {
                                    console.log("Comic is gone!");
                                    // Redraw the table now
                                    fnShowComicsPrep();
                                    // Then close the currently-open dialog box
                                    $("#popViewComicsInfo").dialog("close");
                                } // END If..Else .remove()
                            }); // END .remove()
                            break;
                        case false:
                            console.log("User canceled");
                            break;
                        default:
                            console.log("Some third choice?");
                            break;
                    } // END switch() confirming deletion
                } // END If..Else .get()
            }); // END .get()
        } // END fnDeleteComic()

        // Function to edit a single comic
        function fnEditComic() {
            console.log("fnEditComic() is running");
            // The comic we're about to edit:
            console.log("About to edit: " + tmpComicToDelete);

            // Get Fields of the current comic in question and fill in our Form Input Fields
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("ERROR: " + failure);
                } else {
                    console.log("Populating fields for " + success.title);
                    // Next populate the Fields via .val() (which can read or WRITE data)
                    $("#inTitleEdit").val(success.title);
                    $("#inNumberEdit").val(success.number);
                    $("#inYearEdit").val(success.year);
                    $("#inPublisherEdit").val(success.publisher);
                    $("#inNotesEdit").val(success.notes);
                    $("#inBarcodeEdit").val(success.barcode);
                } // END If..Else .get()
            }); // END .get() to get all comic fields
            $(":mobile-pagecontainer").pagecontainer("change", "#popEditComicsInfo", { "role": "dialog" });
        } // END fnEditComic()

        // Function to run if User cancels the editing of a comic
        function fnEditComicCancel() {
            console.log("fnEditComicCancel() is running");
             //To-do: Make it vibrate when canceling
             //Because user canceled, close the current screen (popup)
            $("#popEditComicsInfo").dialog("close");
        } // END fnEditComicCancel()

        // Function to run if User confirms editing a comic
        function fnEditComicSubmit(event) {
            console.log("fnEditComicSubmit(event) running");
            event.preventDefault();

            // Capture the values currently in the Input Fields
            var $valInTitleEdit = $("#inTitleEdit").val(),
                $valInNumberEdit = Number($("#inNumberEdit").val()),
                $valInYearEdit = Number($("#inYearEdit").val()),
                $valInPublisherEdit = $("#inPublisherEdit").val(),
                $valInNotesEdit = $("#inNotesEdit").val(),
                $valInBarcodeEdit = Number($("#inBarcodeEdit").val());

            // Best practice is to confirm the data in PouchDB, THEN update it
            // and add a new Revision number
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("Error! " + failure);
                } else {
                    console.log("About to update the comic: " + success.title);
                    // After confirming comic exists, re-insert to PouchDB
                    // and include a new _rev Field (is reserved field!!)
                    // like how _id is reserved
                    db.put({
                        "_id": success._id,
                        "title": $valInTitleEdit,
                        "number": $valInNumberEdit,
                        "year": $valInYearEdit,
                        "publisher": $valInPublisherEdit,
                        "notes": $valInNotesEdit,
                        "barcode": $valInBarcodeEdit,
                        "_rev": success._rev
                    }, function (failure, success) {
                        if (failure) {
                            console.log("Error! " + failure);
                        } else {
                            // If success, update the Info screen
                            // and redraw the Table
                            // and close the Edit screen
                            $("#divViewComicsInfo p:eq(0)").html("Name: " + $valInTitleEdit);
                            $("#divViewComicsInfo p:eq(1)").html("Number: " + $valInNumberEdit);
                            $("#divViewComicsInfo p:eq(2)").html("Year: " + $valInYearEdit);
                            $("#divViewComicsInfo p:eq(3)").html("Publisher: " + $valInPublisherEdit);
                            $("#divViewComicsInfo p:eq(4)").html("Notes: " + $valInNotesEdit);
                            $("#divViewComicsInfo p:eq(5)").html("Barcode: " + $valInBarcodeEdit);
                            fnShowComicsPrep();
                            $("#popEditComicsInfo").dialog("close");
                        } // END If..Else .put()
                    }); // END .put() new data
                } // END If..Else .get()
            }); // END .get() to update a comic
        } // END fnEditComicSubmit(event)

        // Function to scan a barcode with device's camera
        // Requires a 3rd-party barcode scanner plugin
        // https://github.com/phonegap/phonegap-plugin-barcodescanner
        function fnScanBarcode() {
            console.log("fnScanBarcode() is running");

            // User presses button, turns on Camera to scan barcode
            // barcode is scanned and passed to the <input> field
            // When they save comic, that data in new <input>
            // is bundled with our Comic data and saved to PouchDB
            cordova.plugins.barcodeScanner.scan(
                function (success) {
                    console.log("Type of barcode: " + success.format);
                    console.log("Data in the barcode: " + success.text);
                    $("#inBarcode").val(success.text);
                },
                function (failure) { window.alert("Scanning failed: " + failure); },
                {
                    "prompt": "Place the comic's barcode in the scan area",
                    "resultDisplayDuration": 2000,
                    "orientation": "landscape",
                    "disableSuccessBeep": false
                }
            ); // END .barcodeScanner.scan()
        } // END fnScanBarcode()

        // Function to take a photo of the comic
        // Requires the Cordova Camera Plugin, a Core plugin in config.xml
        function fnTakePhoto() {
            console.log("fnTakePhoto() is running");
            // Camera syntax: navigator.camera.getPicture(success function, failure function, options);
            navigator.camera.getPicture(
                function (success) {
                    console.log("Got photo: " + success);
                    // Add the path to photo to the Input field in Save Comic screen
                    $("#inPhoto").val(success);
                },
                function (failure) { window.alert("Photo fail! " + failure); },
                {
                    "quality": 50,
                    "saveToPhotoAlbum": true,
                    "targetWidth": 768,
                    "targetHeight": 1024
                }
            ); // END .getPicture()
        } // END fnTakePhoto()

        // Function to send an email to us, the Developer
        // Requires 3rd-party plugin: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
        function fnEmail() {
            console.log("fnEmail() is running");

            window.plugins.socialsharing.shareViaEmail(
                "Regarding your app...<br>", // Message body
                "CBDb feedback", // Subject
                ["victor@victor.com"], // To: field
                null, // CC: field
                null, // BCC: field (null placeholder if nothing)
                "www/images/Spider-Gwen-25-6110285-25.jpg", // www/ required for local attachment
                function (success) { console.log("Success! " + success); },
                function (failure) { console.log("Failure! "+ failure); } // NO FINAL COMMA
            ); // END .shareViaEmail()
        } // END fnEmail()

        // Function to let User share to any social network THEY have installed on their device
        // Works with the same SocialSharing-PhoneGap-Plugin as above
        // https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
        function fnShare() {
            console.log("fnShare() is running");

            window.plugins.socialsharing.share(
                "Check out the CBDb app!", // Message (String),
                "Download CBDb today", // Subject (String) [OPTIONAL depending on network],
                ["www/images/icon-96-xhdpi.png"], // Attachments as an Array of Strings, starting at www/ folder path,
                "http://victorapps.com", // URL (String),
                function (success) { console.log("Success! " + success); }, // Success Function,
                function (failure) { console.log("Failure! " + failure); }// Failure Function // No final comma
            ); // END .share()
        } // END fnShare()

        /* ===== Event Listeners ===== */
        // Use .submit() (JQ) Method when Submitting a form
        $elFormSignUp.submit(function (event) { fnSignUp(event); }); 
        $elFormLogIn.submit(function (event) { fnLogIn(event); });
        // Use .on() (JQ) Method when it's a more "generic" action on a "plain old button"
        // Must specify which Event to listen for
        // Note: anonymous function is not necessary (unless passing data) and parens not needed
        $elBtnLogOut.on("click", fnLogOut);
        // Event Listener for when a person saves a comic
        $elFormSaveComic.submit(function (event) { fnSaveComic(event); });
        // Event Listener for when user clicks to delete collection
        $elBtnDeleteCollection.on("click", fnDeleteCollection);
        // Event Listener for when we click on the Speech Bubble in the Table
        // Note: a second paramenter: the Class of the Speech Bubbles
        // We also capture the data-id info associated with the row that was clicked
        // NOTE: $(this).parent()  = references the <tr> of the <td> we clicked on 
        // $(this)  = <td>
        // .parent() = <tr>
        $elDivShowComicsTable.on("click", ".btnShowComicsInfo",
            function () { fnShowComicsInfo($(this).parent()) });
        // Event Listener for deleting a comic
        $btnDeleteComic.on("click", fnDeleteComic);
        // EL for editing a comic
        $btnEditComic.on("click", fnEditComic);
        // EL for canceling the editing of a comic
        $elBtnEditComicsCancel.on("click", fnEditComicCancel);
        // EL for submitting a change to a comic
        $elFormEditComicsInfo.submit(function (event) { fnEditComicSubmit(event); });
        // EL for scanning a Barcode - NOTE: This needs a 3rd-party Plugin!
        // Remember to activate it in config.xml
        $elBtnScanBarcode.on("click", fnScanBarcode);
        // EL for taking photo - Note: remember to activate CAMERA plugin
        // in config.xml for this to work
        $elBtnTakePhoto.on("click", fnTakePhoto);
        // ELs for sending email and social sharing
        $elBtnEmail.on("click", fnEmail);
        $elBtnShare.on("click", fnShare);
    } // END onDeviceReady()

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    } // END onPause()

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    } // END onResume()

    // Function to stop the default behavior of pressing Back button
    function onBackKeyDown(event) {
        console.log("onBackKeyDown() is running");
        event.preventDefault();
    } // END onBackKeyDown()
})();

/*
    Name:       Victor Campos <vcampos@sdccd.edu>
    Project:    CBDb (The Comic Book Database App)
    Date:       2019-01-31
    Version:    1.0
    Desc:       An app to keep track of a comic book collection. Multi-user support.
*/
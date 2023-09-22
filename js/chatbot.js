$(document).ready(function(){  
    t = 0;
    let searchedProducts = [];

// add loved products here


function toggleSaveClearButtons() {
    var productsData = document.getElementById("products-data");
    var saveClearButtons = document.querySelector(".save-clear");
    
    if (productsData.textContent.trim() === "") {
        saveClearButtons.style.display = "none"; // Hide the buttons
    } else {
        saveClearButtons.style.display = "block"; // Show the buttons
    }
}

// Call the function initially
toggleSaveClearButtons();
    
    $('#send').click(function(e){
        e.preventDefault();
        //console.log(100);

        var prompt = $("#prompt").val().trimEnd();
        if(prompt == ""){
            $("#response").text("Please ask a question.");
        }
        else{
            const BOT_IMG = "images/Promo-Bot-head.png";
            const PERSON_IMG = "images/user.png";
            const BOT_NAME = "PromoBot";
            const PERSON_NAME = "You";

            $("#prompt").val("");
            function myTimer() {
                //console.log(120);
                $("#response").html("<p>Waiting for response... " + t + "s</p>");
                t++;
            }

            function appendMessage(name, img, side, text) {
                //console.log(115);
                const msgHTML = `
                    <div class="msg ${side}-msg">
                        <div class="msg-img" style="background-image: url(${img})"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                                <div class="msg-info-name-${side}">${name}</div>
                                <div class="msg-info-time-${side}">${formatDate(new Date())}</div>
                            </div>
                            <div class="msg-text-${side}">${text}</div>
                        </div>
                    </div>
                `;
                $('#chat').append(msgHTML);
                $('#chat').scrollTop();
            }
            function get(selector, root = document) {
                return root.querySelector(selector);
            }
            function formatDate(date) {
//                console.log(117);
                const h = "0" + date.getHours();
                const m = "0" + date.getMinutes();
                return `${h.slice(-2)}:${m.slice(-2)}`;
            }

            appendMessage(PERSON_NAME, PERSON_IMG, "right", prompt);
            const myInterval = setInterval(myTimer, 1000);          
            isLoading = true;
            console.log(118);

            executePrompt(prompt).then(function(data) {
                console.log(data)
                /*
                data.source
                */
                appendMessage(BOT_NAME, BOT_IMG, "left", data.response);
                let index = data.source.indexOf("(");
                let parsedInfo = data.source.substring(0, index) + data.source.substring(data.source.indexOf(")") + 1);
                $("#source").html("<small class='text-secondary'>" + parsedInfo + "</small>");
                searchProducts(data.response);
                clearInterval(myInterval);
                t = 0;
                $("#response").html("<p></p>");
            }).catch(function(err) {
                clearInterval(myInterval);
                t = 0;
                $("#response").html("<p></p>");
            });
        }
    });
    
    $("#prompt").on("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault(); // prevent default behavior of adding a new line
            $("#send").click(); // trigger the form submission by clicking the button
        }
    });

    $("#products-save").on('click', function(evt) {
        // Get saved products from storage
        let savedProductString = localStorage.getItem('products');
        let savedProducts = JSON.parse(savedProductString) || [];

        let allProducts = savedProducts.concat(searchedProducts);
        localStorage.setItem('products', JSON.stringify(allProducts));

        $('#products-data').empty();
    })

    $("#products-clear").on('click', function(evt) {
        $('#products-data').empty();
    })

    function executePrompt(prompt) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: "https://promobotapi.azurewebsites.net/query",
                method:"POST",
                data: JSON.stringify({input: prompt}),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    resolve(data);
                },
                error: function(xhr, textStatus, error){
                    reject(error);
                    // console.log(199);
                    // console.log(xhr.statusText);
                    // console.log(textStatus);
                    // console.log(error);
                }
            });
        });
    }

    function searchProducts(parsedInfo) {
        console.log('parsedInfo', parsedInfo);
        //let productIds = [...parsedInfo.matchAll(/([A-Z]{1,6})?([0-9]{2,5})([A-Z]{1,6})?([0-9]{1,5})?([A-Z]{1,6})?/g)];
        let productIds = [...parsedInfo.matchAll(/([0-9]{3,6})/g)];
        productIds = productIds.map((x) => x[0]);
        productIds = [... new Set(productIds)];
        console.log('productIds', productIds);
        let productDiv = $('#products-data');
        for (let i = 0; i < productIds.length; i++) {
            let id = productIds[i];
            let url = `https://promobotdatacollectorapi.azurewebsites.net/Products/${id}`;
            console.log('id', id, url);
            fetch(url);
            $.ajax({
                url: `https://promobotdatacollectorapi.azurewebsites.net/Products/${id}`,
                method:"GET",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                error: function(xhr, textStatus, error){
                    console.log(error);
                    // console.log(199);
                    // console.log(xhr.statusText);
                    // console.log(textStatus);
                    // console.log(error);
                }
            }).done(function(data) {            
                console.log('product data', data);
                if (data && data.id) {
                    searchedProducts.push(data);
                    productDiv.append(`<div class="featuredProducts"><img class="productImage" src="${data.product.primaryImageUrl}" style="border-radius: 10px;padding-bottom: 10px;"></div><div><p><strong>${data.product.productName}</strong><br/>${data.product.description}<br/>Supplier: <strong>${data.product.productBrand}</strong> </p></div>`);
                }
            });
            toggleSaveClearButtons();
        }
    }

});
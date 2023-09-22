$(document).ready(function() {
    let template = $('.product-item');
    let container = template.parent();
    let productTemplate = template.remove();

    let lovedItemsJSON = localStorage.getItem('products');
    let lovedItems;
    try {
        lovedItems = JSON.parse(lovedItemsJSON);
    } catch (err) {
        lovedItems = [];
    }

    lovedItems.forEach(function(item) {
        makeItem(item);
    })

    function makeItem(itemData) {
        let element = productTemplate.clone(true);
        $('.product-title', element).text(itemData.product.productName);
        $('.product-loved-img', element).prop('src', itemData.product.primaryImageUrl);
        $('.product-desc', element).text(itemData.product.description);
        $('.product-vendor', element).text(itemData.product.productBrand);
        container.append(element);
    }
});

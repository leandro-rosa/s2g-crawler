const Crawler = require('crawler');

const fs = require("fs");
const { parse } = require("csv-parse");
const {createObjectCsvWriter: createCsvWriter} = require("csv-writer");

const csvWriter = createCsvWriter({
    path: __dirname + '/s2g.csv',

    header: [
        {id: 'name', title: 'Name'},
        {id: 'category', title: 'Category'},
        {id: 'price', title: 'Price'},
        {id: 'sku', title: 'SKU'},
        {id: 'brand', title: 'Brand'},
        {id: 'images', title: 'images'},
    ]
});

const products = []
const execute = () => {

    fs.createReadStream(__dirname + "/crawler.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            addProduct(row)

        })
        .on('end', async () => {
           await new Promise(r => setTimeout(r, 25000));

            csvWriter
                .writeRecords(products)
                .then(()=> console.log('The CSV file was written successfully'));
        })
}

const addProduct = (uri) => {

    const crawler = new Crawler({
        maxConnections: 10,
        callback: (error, res, done) => {
            if (error) {
                console.error(error);
                return
            }
            const $ = res.$;
            const name = $('.product-name .h1').text()
            const category = $('.breadcrumbs .product strong').text()
            const price = $('.price-info .price').text()
            const sku = $('.new-sku-style').text()
            const brand = $('.product-brand a').first().text().trim()
            $('.product-image-gallery .gallery-image').each(function() {
                products.push({name, category, price, sku, brand, images: $(this).attr('src')})
            })

            done();
        }
    });


    crawler.queue(uri)

}

execute()
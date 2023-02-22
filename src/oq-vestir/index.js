const Crawler = require('crawler');

const fs = require("fs");
const { parse } = require("csv-parse");
const {createObjectCsvWriter: createCsvWriter} = require("csv-writer");

const csvWriter = createCsvWriter({
    path: __dirname + '/oq-vestir.csv',

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

            console.log(products)

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
            const name = $('.produt-title--name').text().trim()
            const category = $('.breadcrumb-wrapper .product').text().trim()
            const price = $('.productPrice .price').text().trim()
            const sku = $('.product--sku').text().trim()
            const brand = $('.produt-title--brand').first().text().trim()
            const images = []
            $('.img-zoom').each(function() {
                images.push($(this).attr('src'))
            })

            products.push({name, category, price, sku, brand, images})
            done();
        }
    });


    crawler.queue(uri)

}

execute()
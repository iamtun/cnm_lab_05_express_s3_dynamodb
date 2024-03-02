import express from 'express';
import AWS from 'aws-sdk';

//constant
const PORT = process.env.PORT || 3000;
const TABLE_NAME = process.env.TABLE_NAME || 'Products';

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const app = express();

//register middlewares
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./views'));

//config view
app.set('view engine', 'ejs');
app.set('views', './views');

// routers
app.get('/', (req, res) => {
    const params = {
        TableName: TABLE_NAME,
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.render('index', { products: [] });
        } else {
            return res.render('index', { products: data.Items });
        }
    });
});

app.post('/products', (req, resp) => {
    console.log(req.body);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

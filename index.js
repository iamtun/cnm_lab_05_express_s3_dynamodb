﻿import express from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import e from 'express';
//constant
const PORT = process.env.PORT || 3000;
const TABLE_NAME = process.env.TABLE_NAME || 'Products';

//aws config
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'lab05-s3-dynamo',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(
                null,
                'uploads/' + Date.now().toString() + '-' + file.originalname,
            );
        },
    }),
});

//init server
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

app.post('/products', upload.single('file'), (req, res) => {
    const fileUrl = req.file.location;
    const { product_name, product_type, product_quantity } = req.body;

    const params = {
        TableName: TABLE_NAME,
        Item: {
            id: new Date().getTime().toString(),
            product_name,
            product_type,
            product_quantity,
            product_image: fileUrl,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        } else {
            return res.redirect('/');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

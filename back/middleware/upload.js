const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multerS3 = require("multer-s3");

// configure a V3 S3Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
// ----------------------------------------------------

const storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        let folder = "others";
        const url = req.originalUrl || req.url;

        if (url.includes("products")) folder = "products";
        else if (url.includes("banners")) folder = "banners";
        else if (url.includes("categories") || url.includes("subcategories")) folder = "categories";
        else if (url.includes("users") || url.includes("auth")) folder = "users";
        else if (url.includes("blogs")) folder = "blogs";
        else if (url.includes("offers")) folder = "offers";

        const uniqueName =
            folder + "/" + Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = "*/*";
    if (true) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
}
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});
async function getOgjectURL(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });
    const url = await getSignedUrl(s3, command);
    return url;
}

module.exports = {
    upload,
    getOgjectURL,
};
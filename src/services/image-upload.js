const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: '9PHoIN+WunFgrXjYoAbcJlgahyfF0Vvim2UJw3xb',
  accessKeyId: 'AKIA45EYKAZYNACFDLOO',
  region: 'us-east-2'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' ||  file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3:s3,
    bucket: 'priceshoes',
    key: function (req, file, cb) {
      cb(null, file.originalname) // Date.now().toString()
    }
  })
});

module.exports = upload;

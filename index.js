const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
    console.log("-----event-----", event)
    const { originalname, mimetype, buffer } = event;
    if (['image/png', 'image/jpeg', 'image/jpg'].includes(mimetype)) {
        try{
            const fileSizeInBytes = Buffer.byteLength(new Buffer.from(buffer.data));
            if (fileSizeInBytes > 2000000) {
               callback(null,  {
                    statusCode: '400',
                    body: 'filesize larger than 2MB'
                });
            }
            const s3_response = await upload_s3(event);
            console.log("s3_response", s3_response)
            callback(null, {
                statusCode: '200',
                body: s3_response['Location']
            })
            
        }catch(error){
            callback(null, {
                statusCode: '500',
                body: `something went wrong ${error}`
            })
        }      
    } else {
        callback(null, {
            statusCode: '422',
            body: 'Incorrect file format'
        })
    }
};

const upload_s3 = async (form) => {
    console.log("------form.buffer.data---------", form.buffer.data)
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const key = `${uniqueId}-${form.originalname}`;
    const request = {
        Bucket: 'aya-aws-bucket',
        Key: `images/${key}`,
        Body: new Buffer.from(form.buffer.data),
        contentType: form.mimetype
    }
    try {
        const data = await s3.upload(request).promise();
        return data
    } catch (e) {
        console.log('Error uploading to S3: ', e)
        return e
    }
}
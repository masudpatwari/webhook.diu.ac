/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";
require('https').globalAgent.options.ca = require('ssl-root-cas').create();

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
// const token = 'nvXNp9oW5xnMalmxcv$ZNMpKogHsc82caBc5PhmoIg';
const token = 'nvXNp9oW5xnMalmxcv$ZNMpKogHsc82caBc5PhmoIg';
const mongoose = require('mongoose');
const moment = require('moment-timezone'); //moment-timezone
const {TextDecoder, TextEncoder} = require("util");
const mysql = require('mysql');
const fs = require('fs');
const Path = require('path');
const multer = require('multer');
const mime = require('mime-types');

// moment.tz('Asia/Dhaka');

// const connection = mysql.createConnection({
const mysql_pool = mysql.createPool({
    connectionLimit : 100,
    host            : '10.11.12.70',
    port            : '3306',
    user            : 'admin',
    password        : 'Diu2009*)(root',
    database        : 'whats_app',
    charset         : 'utf8mb4',
});


// Imports dependencies and set up http server
const request = require("request"),
    express = require("express"),
    body_parser = require("body-parser"),
    axios = require("axios").default,
    app = express().use(body_parser.json());
const {response} = require("express"); // creates express http server

const currentTime = moment().tz('Asia/Dhaka').format('YYYY-MM-DD hh:mm:ss a');
// Sets server port and logs message on success
app.listen(3000 || 1337, () => console.log("webhook is listening at: "+currentTime));

// mysql_pool.getConnection(function(err1, connection){
//     if (err1) {
//         connection.release();
//         console.log(' Error getting mysql_pool connection: ' + err1);
//     }
//     connection.connect(function(err) {
//         if (err) {
//             console.error('error connecting: ' + err.stack);
//             return;
//         }
//
//         console.log('connected as id ' + connection.threadId);
//         connection.release();
//
//     });
// });

app.get('/get-messages', (req, res) => {
    let sql = 'SELECT * FROM messages where display_phone_number != "8801722711523"';

    mysql_pool.getConnection(function(err1, connection){
        if (err1) {
            connection.release();
            console.log(' Error getting mysql_pool connection: ' + err1);
        }
        connection.query(sql, function (err, result) {
            if(err) throw err;
            connection.release();
            res.send(result);
        });
    });

});


// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {

    //    const token= 'EAAJZAwBzCJXsBADZCXckR49EQA5ftL6D57wN0PiCWYlA3JAPpL5jKaWGwaCb6ZBNiGVamJtixOMs9eKuhWPMyNJw0ZCVMzZCeDAuaQdi6rx7RrSJEFKO7ZAOCG7YokPNn8EdoXp8ZC8BDjGYBcWZA8RZA0zzAeBCikYiDuxspVsaVwZAg77lnECgBq'


   const token= 
   'EAAJZAwBzCJXsBADHq2HuMq6BRMaFAeWWuZB5oSvDri14C6qsQ9uf2t7QAR5ZAWqQ7lrUBn4OTFcwGMr7ZAHVcch0atZCZBn1Quef9XSRIFRwMzj8YhIx2X785ZBRwuROoBZB0zUxGqPZAm8E55zK5dgAonsESvRzqvYLq9byipyU0jXIfUcjIjQNP'
    
    let body = req.body;






    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));




    console.log("============================================================")
    console.log(body);
    const display_phone_number = null;
    const event = null;
    const current_limit = null;
    let messages = [];

    const {object, entry} = body;

    const {id, changes} = entry[0];
    const {field, value} = changes[0];

    if(value !== 'messages')
    {
        const {display_phone_number, event, current_limit, messages} = value;
    }

    if(field === "messages")
    {
        console.log('messages field');
        const {messaging_product, metadata, contacts, messages} = value;
        const {display_phone_number, phone_number_id} = metadata;

        if(messages !== undefined)
        {
            console.log('has messages field');

            if(messages[0].hasOwnProperty('type') && messages[0].hasOwnProperty('system'))
            {
                const {from, id, timestamp, system, type} = messages[0];

                const {body, wa_id, system_type} = system;

                const {display_phone_number, phone_number_id} = metadata;


                if(type === 'system')
                {
                    const sql = `INSERT INTO number_changes (display_phone_number, phone_number_id, messages_from, messages_id, timestamp, system_body, wa_id, type)
                             VALUES ('${display_phone_number}', '${phone_number_id}', '${from}', '${id}', '${timestamp}', '${body}', '${wa_id}', '${type}')`;

                    mysql_pool.getConnection(function(err1, connection){
                        if (err1) {
                            connection.release();
                            console.log(' Error getting mysql_pool connection: ' + err1);
                        }
                        connection.query(sql, function (err, result) {
                            if(err) {
                                console.log(err);
                            }
                            console.log(result);

                            facebookResponse(from, body, phone_number_id, res);

                            console.log('facebook response status for system sms');

                            connection.release();

                        });
                    })
                }

            }

            const {from, id, timestamp, type, text} = messages[0];

            if(value.hasOwnProperty('messages')) {
                console.log('has messages body with contacts');

                const {profile, wa_id} = contacts[0];

                let profile_name = profile['name'];

                const now = moment().tz('Asia/Dhaka').subtract(7, 'h').format('YYYY-MM-DD HH:mm:ss');

                if (type === "text") {
                    const {msg_body} = text;

                    let message = text['body'];


                    const sql = `INSERT INTO messages (display_phone_number, phone_number_id, profile_name, wa_id, sender, message_id, status, time, type, text, created_at)
                    VALUES ('${display_phone_number}', '${phone_number_id}', '${profile_name}', '${wa_id}', '${from}', '${id}', 'unseen','${timestamp}', '${type}', '${message}', '${now}')`;

                    mysql_pool.getConnection(function(err1, connection){
                        if (err1) {
                            connection.release();
                            console.log(' Error getting mysql_pool connection: ' + err1);
                        }
                        connection.query(sql, function (err, result) {
                            if (err) {
                                console.log(JSON.stringify(err, null, 2));

                                // return res.sendStatus(409);
                            }
                            console.log(result);

                            console.log('facebook response status for text sms');
                            connection.release();
                            // facebookResponse(from, message, phone_number_id);
                        });
                    });
                }

                if (type === "image") {
                    console.log('got an image type sms');
                    const {from, message_id, timestamp, type, image} = messages[0];
                    let from_number = from;
                    const {caption, mime_type, sha256, id} = image;

                    let image_id = image['id'];

                    const sql = `INSERT INTO messages (display_phone_number, phone_number_id, profile_name, wa_id, sender, message_id, time, type, image_caption, mime_type, image_id, created_at)
                    VALUES ('${display_phone_number}', '${phone_number_id}', '${profile_name}', '${wa_id}', '${from}', '${id}', '${timestamp}', '${type}', '${caption}', '${mime_type}', '${image_id}', '${now}')`;


                    mysql_pool.getConnection(function(err1, connection){
                        if (err1) {
                            connection.release();
                            console.log(' Error getting mysql_pool connection: ' + err1);
                        }

                        connection.query(sql, function (err, result) {
                            if(err) {
                                console.log(err);
                            }
                            console.log(result);
                            connection.release();
                        });
                    });

                    retrieveFile(image_id, image['mime_type']);


                }

                if (type === "document") {
                    console.log('got a document type sms');
                    const {from, message_id, timestamp, type, document} = messages[0];
                    let from_number = from;
                    const {caption, filename, mime_type, sha256, id} = document;


                    const sql = `INSERT INTO messages (display_phone_number, phone_number_id, profile_name, wa_id, sender, message_id, time, type, image_caption, mime_type, image_id, created_at)
                    VALUES ('${display_phone_number}', '${phone_number_id}', '${profile_name}', '${wa_id}', '${from}', '${id}', '${timestamp}', '${type}', '${caption}', '${mime_type}', '${id}', '${now}')`;

                    mysql_pool.getConnection(function(err1, connection){
                        if (err1) {
                            connection.release();
                            console.log(' Error getting mysql_pool connection: ' + err1);
                        }

                        connection.query(sql, function (err, result) {
                            if(err) {
                                console.log(err);
                            }
                            console.log(result);
                            connection.release();
                        });
                    });

                    retrieveFile(id, document['mime_type']);


                }
            }
        }


        if(messages === undefined)
        {

            const now = moment().tz('Asia/Dhaka').subtract(7, 'h').format('YYYY-MM-DD HH:mm:ss');

            const {messaging_product, metadata, statuses} = value;

            const{id, status, timestamp, recipient_id} = statuses[0];


            if(status === "read")
            {
                const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}', updated_at = '${now}' WHERE message_id = '${id}'`;

                mysql_pool.getConnection(function(err1, connection){
                    if (err1) {
                        connection.release();
                        console.log(' Error getting mysql_pool connection: ' + err1);
                    }
                    connection.query(sql, function (err, result) {
                        if(err) {
                            console.log(JSON.stringify(err, null, 2));

                            // return res.sendStatus(409);
                        }
                        console.log(result);
                        connection.release();
                    });
                });
            }


            if(status === "delivered")
            {
                const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}', updated_at = '${now}' WHERE message_id = '${id}'`;

                mysql_pool.getConnection(function(err1, connection){
                    if (err1) {
                        connection.release();
                        console.log(' Error getting mysql_pool connection: ' + err1);
                    }
                    connection.query(sql, function (err, result) {
                        if(err) {
                            console.log(JSON.stringify(err, null, 2));

                            // return res.sendStatus(409);
                        }
                        console.log(result);
                        connection.release();
                    });
                });
            }


            if(status === "failed")
            {
                if(statuses[0].hasOwnProperty('errors'))
                {
                    const{id, status, timestamp, recipient_id, errors} = statuses[0];


                    const{code, title} = errors[0];

                    const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}', error_code = '${code}', error = '${title}', updated_at = '${now}' WHERE message_id = '${id}'`;

                    mysql_pool.getConnection(function(err1, connection){
                        if (err1) {
                            connection.release();
                            console.log(' Error getting mysql_pool connection: ' + err1);
                        }
                        connection.query(sql, function (err, result) {
                            if(err) {
                                console.log(JSON.stringify(err, null, 2));

                                // return res.sendStatus(409);
                            }
                            console.log(result);
                            connection.release();
                        });
                    });
                }
            }


            if(status === "sent")
            {
                const{id, status, timestamp, recipient_id, conversation, pricing} = statuses[0];

                const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}', updated_at = '${now}' WHERE message_id = '${id}'`;

                mysql_pool.getConnection(function(err1, connection){
                    if (err1) {
                        connection.release();
                        console.log(' Error getting mysql_pool connection: ' + err1);
                    }
                    connection.query(sql, function (err, result) {
                        if(err) {
                            console.log(JSON.stringify(err, null, 2));

                            // return res.sendStatus(409);
                        }
                        console.log(result);
                        connection.release();
                    });
                });
            }

        }

        res.sendStatus(200);

        fs.appendFile('log.txt', '\n'+JSON.stringify(req.body, null, 2), function (err) {
            console.log('file saved');
        });
    }




});

// if (req.body.object) {
//     if (
//         req.body.entry &&
//         req.body.entry[0].changes &&
//         req.body.entry[0].changes[0] &&
//         req.body.entry[0].changes[0].value.messages &&
//         req.body.entry[0].changes[0].value.messages[0]
//     ) {
//         let phone_number_id =
//             req.body.entry[0].changes[0].value.metadata.phone_number_id;
//         let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
//         let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
//         axios({
//             method: "POST", // Required, HTTP method, a string, e.g. POST, GET
//             url:
//                 "https://graph.facebook.com/v12.0/" +
//                 phone_number_id +
//                 "/messages?access_token=" +
//                 token,
//             data: {
//                 messaging_product: "whatsapp",
//                 to: from,
//                 text: { body: "Ack: " + msg_body },
//             },
//             headers: { "Content-Type": "application/json" },
//         }).catch((error) => {
//             console.log(error);
//         });
//     }
//     res.sendStatus(200);
// } else {
//     // Return a '404 Not Found' if event is not from a WhatsApp API
//     res.sendStatus(404);
// }
// Accepts POST requests at /webhook endpoint
app.post("/permission", (req, res) => {
    // Parse the request body from the POST


    console.log('permission post route');
    // const token = 'EAALXQC2uJj8BAH5yMI8ZCDaMCxaZAIVSgDHRC4FZAZA6Wyi4MEICL5M4CuDEl4Nmvbt3JxyIjSKWoawLOqIU1ncpM9FRBcW0EiN6PfKjxqSc5eqg8O7Nt1vljIKchnKpXpJ3VH0r0UNAdo5NXnAXZAnOT2xSZAkE9X8SGnsvoWaYvjZBfCj09qiPE0ZCdP15VUcrhUCeHuMkcf0vDP3rcQat';


    const token = 'EAAJZAwBzCJXsBADZCXckR49EQA5ftL6D57wN0PiCWYlA3JAPpL5jKaWGwaCb6ZBNiGVamJtixOMs9eKuhWPMyNJw0ZCVMzZCeDAuaQdi6rx7RrSJEFKO7ZAOCG7YokPNn8EdoXp8ZC8BDjGYBcWZA8RZA0zzAeBCikYiDuxspVsaVwZAg77lnECgBq'
    // const display_phone_number = null;
    // const event = null;
    // const current_limit = null;
    // let messages = [];

    let body = req.body;

    console.log(JSON.stringify(body, null, 2));

    const {object, entry} = body;

    const {id, uid, time, changed_fields} = entry[0];

    const fields = JSON.stringify(changed_fields, null, 2);

    console.log(fields);
    // const {field, value} = body;

    // console.log(object);

    // const {id, time, changes} = entry[0];
    // if(changes == undefined){
    //     const {id, changes} = entry[0];
    // }
    // const {field, value} = body;

    // let sql = `INSERT INTO 'permissions' SET ('id', 'uid', 'time', 'changed_fields') VALUES (${id}, ${uid}, ${time}, ${changed_fields})`;
    //
    // connection.query(sql, function (err, result) {
    //    if(err) throw err;
    //    console.log(result);
    // });

    const now = moment().tz('Asia/Dhaka').subtract(7, 'h').format('YYYY-MM-DD HH:mm:ss');


    const sql = `INSERT INTO business_message_permission (uid, time, changes_fields ,created_at) VALUES ('${uid}', '${time}', '${fields}', '${now}')`;


    connection.query(sql, function (err, result) {

        if(err) throw err;

        console.log(result);
    });


    console.log(object, id, uid, time, fields);

    // if(value !== 'messages')
    // {
    //     const {display_phone_number, event, current_limit, messages} = value;
    // }

    // if(field === "messages")
    // {
    //     const {verb, target_ids} = value;
    //
    //     console.log(field, verb, target_ids);

    // try {
    //     axios({
    //         method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    //         url:
    //             "https://graph.facebook.com/v12.0/" +
    //             '100896829313016' +
    //             "/messages?access_token=" +
    //             token,
    //         data: {
    //             messaging_product: "whatsapp",
    //             to: from,
    //             text: { body: "Ack: " + msg_body },
    //         },
    //         headers: { "Content-Type": "application/json" },
    //     }).then((response) => {
    //         console.log(response.data);
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    //
    //     console.log('Message sent');
    //
    // } catch (error) {
    //     if (error.response){
    //
    //         console.log(error.response);
    //
    //     }else if(error.request){
    //
    //         console.log(error.request);
    //
    //     }else if(error.message){
    //
    //         console.log(error.message);
    //
    //     }
    // }
    // }


    // console.log(object, id, time, field, decision);

    // console.log(JSON.stringify(changes, null, 2));

    // Check the Incoming webhook message

    fs.appendFile('log.txt', '\n'+JSON.stringify(req.body, null, 2), function (err) {
        console.log('file saved');
    });

    return res.sendStatus(200);

    // if (req.body.object) {
    //     if (
    //         req.body.entry &&
    //         req.body.entry[0].changes &&
    //         req.body.entry[0].changes[0] &&
    //         req.body.entry[0].changes[0].value.messages &&
    //         req.body.entry[0].changes[0].value.messages[0]
    //     ) {
    //         let phone_number_id =
    //             req.body.entry[0].changes[0].value.metadata.phone_number_id;
    //         let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
    //         let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
    //         axios({
    //             method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    //             url:
    //                 "https://graph.facebook.com/v12.0/" +
    //                 phone_number_id +
    //                 "/messages?access_token=" +
    //                 token,
    //             data: {
    //                 messaging_product: "whatsapp",
    //                 to: from,
    //                 text: { body: "Ack: " + msg_body },
    //             },
    //             headers: { "Content-Type": "application/json" },
    //         }).catch((error) => {
    //             console.log(error);
    //         });
    //     }
    //     res.sendStatus(200);
    // } else {
    //     // Return a '404 Not Found' if event is not from a WhatsApp API
    //     res.sendStatus(404);
    // }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
   


    //const verify_token = 'EAALXQC2uJj8BAH5yMI8ZCDaMCxaZAIVSgDHRC4FZAZA6Wyi4MEICL5M4CuDEl4Nmvbt3JxyIjSKWoawLOqIU1ncpM9FRBcW0EiN6PfKjxqSc5eqg8O7Nt1vljIKchnKpXpJ3VH0r0UNAdo5NXnAXZAnOT2xSZAkE9X8SGnsvoWaYvjZBfCj09qiPE0ZCdP15VUcrhUCeHuMkcf0vDP3rcQat'

    
    const verify_token = 'EAAJZAwBzCJXsBADZCXckR49EQA5ftL6D57wN0PiCWYlA3JAPpL5jKaWGwaCb6ZBNiGVamJtixOMs9eKuhWPMyNJw0ZCVMzZCeDAuaQdi6rx7RrSJEFKO7ZAOCG7YokPNn8EdoXp8ZC8BDjGYBcWZA8RZA0zzAeBCikYiDuxspVsaVwZAg77lnECgBq'


    
    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
    // return token;
// console.log(req.query);
//     // Check if a token and mode were sent
//     if (mode && token) {
//         // Check the mode and token sent are correct
//         if (mode === "subscribe" && token === verify_token) {
//             // Respond with 200 OK and challenge token from the request
//             console.log("WEBHOOK_VERIFIED");
//             res.status(200).send(challenge);
//         } else {
//             // Responds with '403 Forbidden' if verify tokens do not match
//             res.sendStatus(403);
//         }
//     }else{
//         return res.status(401).send({
//             'status':401,
//             'result':false,
//             'message':"params not found"
//         })
//     }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/permission", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/


    const verify_token = 'EAALXQC2uJj8BAH5yMI8ZCDaMCxaZAIVSgDHRC4FZAZA6Wyi4MEICL5M4CuDEl4Nmvbt3JxyIjSKWoawLOqIU1ncpM9FRBcW0EiN6PfKjxqSc5eqg8O7Nt1vljIKchnKpXpJ3VH0r0UNAdo5NXnAXZAnOT2xSZAkE9X8SGnsvoWaYvjZBfCj09qiPE0ZCdP15VUcrhUCeHuMkcf0vDP3rcQat';

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});


app.get('/create-table', (req, res) => {
    let sql = 'CREATE TABLE `business_message_permission` (`id` int(11) NOT NULL AUTO_INCREMENT, `uid` varchar(255) NOT NULL, `time` timestamp, `changes_fields` JSON,`created_at` datetime NOT NULL, `updated_at` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=latin1;';

    connection.query(sql, function (err, result) {
        if(err) throw err;
        console.log("Table created");
        res.send('business_message_permission table created');
    });

});

app.get('/create-messages-table', (req, res) => {
    let sql = 'CREATE TABLE `messages` (`id` int(11) NOT NULL AUTO_INCREMENT, `display_phone_number` varchar(20) NOT NULL, `phone_number_id` varchar(20) NOT NULL, `profile_name` varchar(20) NOT NULL, `wa_id` varchar(20) NOT NULL,  `from` varchar(20) NOT NULL, `from_id` varchar(20) NOT NULL, `time` timestamp, `text` Text,`created_at` datetime NOT NULL, `updated_at` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=latin1;';

    connection.query(sql, function (err, result) {
        if(err) throw err;
        console.log("Table created");
        res.send('business_message_permission table created');
    });

});

app.get('/', (req, res) => {
    let state = req.query["state"];



    res.send('Facebook API Endpoint');
    
});



function facebookResponse(from_number, sms_body, phone_number_id, res)
{
    try {
        axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
                "https://graph.facebook.com/v14.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
            data: {
                messaging_product: "whatsapp",
                to: from_number,
                text: { body: "Ack: " + sms_body },
            },
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            console.log(response.data);
        }).catch((error) => {
            console.log(JSON.stringify(error, null, 2));
        });

        console.log('Message sent');

    } catch (error) {
        if (error.response){

            console.log(error.response);

            return error.response;


        }else if(error.request){

            console.log(error.request);
            return error.request;


        }else if(error.message){

            console.log(error.message);
            return error.message;
        }
    }
}

function retrieveFile(file_id, mime_type)
{
    console.log('Need to retrieve the file');


    try {
        axios({
            method: "get", // Required, HTTP method, a string, e.g. POST, GET
            url:
                "https://graph.facebook.com/v14.0/" +
                file_id,
            headers: { 'Authorization': 'Bearer EAALXQC2uJj8BAFMthdjOF7BhP0GlQuqrdWOdl2IpPTZAfHiQ4FmkZCD4FhYACq8CEsitzlWPACJm6NSiQQxwEghZBkZCxP3FZB6roLdrwYwxv6mVnbiXQjiY2UZC46rUO4I2BTEMTAWeIuZBQlSpp8MMs77JVCvWJlnRMNbkM6r9YANQyoPDw5VJsjwy10o3swd4ef03LJqMgZDZD' },
        }).then((response) => {

            // const {file_url, mime_type, sha256, file_size, id, messaging_product} = response.data;

            const file_url = response.data.url;
            // console.log(file_url, mime_type, sha256, file_size, id, messaging_product);

            axios({
                method: "get", // Required, HTTP method, a string, e.g. POST, GET
                url:
                file_url,
                responseType: 'stream',
                headers: { 'Authorization': 'Bearer EAALXQC2uJj8BAFMthdjOF7BhP0GlQuqrdWOdl2IpPTZAfHiQ4FmkZCD4FhYACq8CEsitzlWPACJm6NSiQQxwEghZBkZCxP3FZB6roLdrwYwxv6mVnbiXQjiY2UZC46rUO4I2BTEMTAWeIuZBQlSpp8MMs77JVCvWJlnRMNbkM6r9YANQyoPDw5VJsjwy10o3swd4ef03LJqMgZDZD' },
            }).then((response) => {

                let fileExtension = mime.extension(mime_type);
                let filename = file_id+'.'+fileExtension;

                const path = Path.resolve(__dirname, 'images', filename)
                const writer = fs.createWriteStream(path)

                response.data.pipe(writer)

                const now = moment().tz('Asia/Dhaka').subtract(7, 'h').format('YYYY-MM-DD HH:mm:ss');


                const sql = `UPDATE messages SET image_url = '${filename}', updated_at = '${now}' WHERE image_id = '${file_id}'`;

                connection.query(sql, function (err, result) {
                    if(err) {
                        console.log(JSON.stringify(err, null, 2));

                        // return res.sendStatus(409);
                    }
                    console.log(result);
                });

                // return new Promise((resolve, reject) => {
                //     writer.on('finish', resolve)
                //     writer.on('error', reject)
                // });

                console.log('got image');
                console.log(typeof(response.data));
                // console.log(response.data);


            }).catch((error) => {
                console.log(JSON.stringify(error, null, 2));
            });


        }).catch((error) => {
            console.log(JSON.stringify(error, null, 2));
        });

        console.log('File info retrieved');

    } catch (error) {
        if (error.response){

            console.log(error.response);

            return error.response;


        }else if(error.request){

            console.log(error.request);
            return error.request;


        }else if(error.message){

            console.log(error.message);
            return error.message;
        }
    }
    console.log(file_id);
}

// app.use(express.static('images'));
const path = require('path');

app.use(express.static(path.join(__dirname, 'images/')))


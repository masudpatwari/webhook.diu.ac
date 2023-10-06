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
// moment.tz('Asia/Dhaka');

const connection = mysql.createConnection({
    host     : '10.11.12.70',
    port     : '3306',
    user     : 'admin',
    password : 'Diu2009*)(root',
    database : 'whats_app'
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


connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

app.get('/get-messages', (req, res) => {
    let sql = 'SELECT * FROM messages where display_phone_number != "8801722711523"';

    connection.query(sql, function (err, result) {
        if(err) throw err;
        res.send(result);
    });
});


// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
    // Parse the request body from the POST

    const token = 'EAALXQC2uJj8BAFm0dihQvxQiXn4tlZCYxXseJD4WRfmM1y9SpybK6kB0dZBlaREig74zFsOOQcxxCXVpuFIX6AZB9tRZBBQIMq1r0bvia4ZCF9t1UzVU28phcx3ULNmoB2a4BnqixzRwKrrWxlyHWbuPZAoTJ6YqlV9fmNeDHP2B5kQWQ8lchUoLxMBQQNnxmNWZB0ccUNOjgZDZD';
    const display_phone_number = null;
    const event = null;
    const current_limit = null;
    let messages = [];

    let body = req.body;

    const {object, entry} = body;

    console.log(JSON.stringify(body, null, 2));

    // console.log(object);

    // console.table(body);

    // if(changes == undefined){
    const {id, changes} = entry[0];
    // }
    const {field, value} = changes[0];

    if(value !== 'messages')
    {
        const {display_phone_number, event, current_limit, messages} = value;
    }

    if(field === "messages")
    {
        // console.table(value);
        const {messaging_product, metadata, contacts, messages} = value;



        // const {messaging_product, metadata, statuses} = value;
        const {display_phone_number, phone_number_id} = metadata;
        // console.log(JSON.stringify(entry, null, 2));

        if(messages !== undefined)
        {
            const {from, id, timestamp, type, text} = messages[0];
            const {profile, wa_id} = contacts[0];

            let profile_name = profile['name'];

            const now = moment().tz('Asia/Dhaka').subtract(7, 'h').format('YYYY-MM-DD HH:mm:ss');


            if(type === "text")
            {
                const {msg_body} = text;

                let message = text['body'];

                const sql = `INSERT INTO messages (display_phone_number, phone_number_id, profile_name, wa_id, sender, message_id, status, time, type, text, created_at)
                    VALUES ('${display_phone_number}', '${phone_number_id}', '${profile_name}', '${wa_id}', '${from}', '${id}', 'unseen','${timestamp}', '${type}', '${message}', '${now}')`;

                connection.query(sql, function (err, result) {
                    if(err) {
                        console.log(err);
                    }
                    console.log(result);
                });

            }

            if(type === "image")
            {
                const {from, message_id, timestamp, type, image} = messages[0];
                const {caption, mime_type, sha256, id} = image;


                const sql = `INSERT INTO messages (display_phone_number, phone_number_id, profile_name, wa_id, sender, message_id, time, type, image_caption, mime_type, image_id, created_at)
                    VALUES ('${display_phone_number}', '${phone_number_id}', '${profile_name}', '${wa_id}', '${from}', '${id}', '${timestamp}', '${type}', '${caption}', '${mime_type}', '${id}', '${now}')`;

            }



        }

        if(messages === undefined)
        {
            const {messaging_product, metadata, statuses} = value;

            const{id, status, timestamp, recipient_id} = statuses[0];

            let sql = `SELECT message_id, status FROM messages WHERE wa_id = '${recipient_id}' ORDER BY time DESC LIMIT 1`;
            // const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}' WHERE message_id = '${id}'`;

            connection.query(sql, function (err, result) {
                if(err) {
                    console.log(err);
                }
                console.log(result);
            });

            if(status === "read")
            {
                const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}' WHERE message_id = '${id}'`;

                connection.query(sql, function (err, result) {
                    if(err) {
                        console.log(err);
                    }
                    console.log(result);
                });
            }


            if(status === "delivered")
            {
                const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}' WHERE message_id = '${id}'`;

                connection.query(sql, function (err, result) {
                    if(err) {
                        console.log(err);
                    }
                    console.log(result);
                });
            }

        }


        // console.log(display_phone_number, phone_number_id, profile['name'] ,wa_id ,from , id ,timestamp ,text['body']);

        // const sql = `INSERT INTO messages (display_phone_number, phone_number_id, profile_name ,wa_id ,from ,from_id ,time ,text ,created_at) VALUES ('${display_phone_number}', '${phone_number_id}', '${profile_name}', '${wa_id}', '${from}', '${id}', '${timestamp}', '${message}', '${now}')`;




        // try {
        //     axios({
        //         method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        //         url:
        //             "https://graph.facebook.com/v14.0/" +
        //             phone_number_id +
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
    }


    // console.log(object, id, time, field, decision);

    // console.log(JSON.stringify(changes, null, 2));

    // Check the Incoming webhook message
    // console.log(JSON.stringify(req.body, null, 2));

    fs.appendFile('log.txt', '\n'+JSON.stringify(req.body, null, 2), function (err) {
        console.log('file saved');
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
});
// Accepts POST requests at /webhook endpoint
app.post("/permission", (req, res) => {
    // Parse the request body from the POST


    let response = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "114934044554590",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "8801302690349",
                                "phone_number_id": "111336181590950"
                            },
                            "messages": [
                                {
                                    "from": "252615408817",
                                    "id": "wamid.HBgMMjUyNjE1NDA4ODE3FQIAEhgSQkMyNTAxNTE2MzkyRjA4Njk4AA==",
                                    "timestamp": "1655788363",
                                    "system": {
                                        "body": "User A changed from 252615408817 to 252610572047",
                                        "wa_id": "252610572047",
                                        "type": "user_changed_number"
                                    },
                                    "type": "system"
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    };

    let status = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "114934044554590",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "8801302690349",
                                "phone_number_id": "111336181590950"
                            },
                            "contacts": [
                                {
                                    "profile": {
                                        "name": "TAHIDUR RAHMAN TUHIN"
                                    },
                                    "wa_id": "8801722711523"
                                }
                            ],
                            "messages": [
                                {
                                    "from": "8801722711523",
                                    "id": "wamid.HBgNODgwMTcyMjcxMTUyMxUCABIYIDQ4RTI0OTBBQ0I0NkMxMEY3RUE4RTE0NkJGNDVERTIyAA==",
                                    "timestamp": "1657952782",
                                    "text": {
                                        "body": "check 104"
                                    },
                                    "type": "text"
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    };


    console.log('permission post route');
    const token = 'EAALXQC2uJj8BAH5yMI8ZCDaMCxaZAIVSgDHRC4FZAZA6Wyi4MEICL5M4CuDEl4Nmvbt3JxyIjSKWoawLOqIU1ncpM9FRBcW0EiN6PfKjxqSc5eqg8O7Nt1vljIKchnKpXpJ3VH0r0UNAdo5NXnAXZAnOT2xSZAkE9X8SGnsvoWaYvjZBfCj09qiPE0ZCdP15VUcrhUCeHuMkcf0vDP3rcQat';
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



    /*
    *  check message exist or not
    *
    *

                let sql1 = `SELECT message_id, status FROM messages WHERE wa_id = '${recipient_id}' ORDER BY time DESC LIMIT 1`;
                // const sql = `UPDATE messages SET status = '${status}', status_changed_time = '${timestamp}' WHERE message_id = '${id}'`;

                connection.query(sql1, function (err, result) {
                    if(err) {
                        console.log(err);
                    }
                    console.log('from checking sql query: ');
                    console.log(result);
                });
    *
    * */



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
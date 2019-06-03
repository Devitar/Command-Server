const net = require('net');
const fs = require('fs');
const uuid = require('uuid/v4')

const date = new Date();
const month = (date.getUTCMonth() + 1).toString();
const day = (date.getUTCDate()).toString();
const year = (date.getUTCFullYear()).toString();
const seconds= (date.getSeconds()).toString();
const hours = (date.getHours()).toString();
const minutes = (date.getMinutes()).toString();

const serverLog = fs.createWriteStream(`serverlog${month+'-'+day+'-'+year+'_'+hours+'-'+minutes+'-'+seconds}.txt`);

const adminPassword = "password123";

let clients = [];

class Client {
    constructor(client, name, id){
        this.client = client,
        this.name = name,
        this.id = id
    };
    getProperty(prop){
        return this[prop];
    }
    setProperty(prop, val){
        this[prop] = val;
    }
};

let server = net.createServer((client) => {
    let id = uuid();
    let clientObj = new Client(client, null, id);
    clientObj.getProperty('client').write('Welcome to the chat room, what is your name?');
    serverLog.write("New user connected: Client "+id+"\n");
    client.on("data", (data) => {
        // let dataString = "";
        data = data.toString('utf8').trim();
        if (!clientObj.getProperty('name')){
            clientObj.setProperty('name', data);
            clients.push(clientObj);
            serverLog.write(`Client(${id}) set name to ${data}.`+"\n");
            sendToAll(clientObj, `New user connected: ${data}`);
            clientObj.getProperty('client').write('You are now connected to the chat room.');
        }else{
            handleData(data, clientObj);
        }
    });
    client.on("end", () => {
        sendToAll(clientObj, `User disconnected: ${clientObj.getProperty('name')}`);
        serverLog.write(`User disconnected: Client ${id, clientObj.getProperty('name')}`+"\n");
        let foundClient = null;
        clients.forEach((sClient, index) => {
            if (sClient.id == id){
                foundClient = index;
            };
        });
        if (foundClient !== null){
            clients.splice(foundClient, 1);
        }else{
            console.log(`Error, no client(${id}) found in clients.`);
        };
    })
});

server.listen(5000, () => {
    console.log("Server is active, Port 5000");
});

server.on('error', (err) => {
    console.log('error --');
    throw err;
});

server.on('end', (client) => {
    console.log("Client disconnected: ", client);
})

server.on('close', () => {
    console.log("Server Closing.");
    serverLog.close();
})

function sendToAll(except, message){
    clients.forEach((sClient, id) => {
        if (except.getProperty('client') !== sClient.getProperty('client')){
            sClient.client.write(message);
        };
    });
};

const firstArg = new RegExp(/\/(.*?)[\s]/i); //grab command
const secondArg = new RegExp(/\/w\s([^\s]*)/i);//grab after command
// const serverCommands = [
//     new RegExp(/\/w\s/i), //grabs "/w "

// ];

function handleData(data, client){
    if (data.substring(0, 1) === "/"){
        console.log("Command found");
        let command = data.match(firstArg);//firstArg.test(data);//data.search(firstArg);
        console.log("First Regex", command[0], ";");
        if (command !== null){
            if (command[0] !== "/clientlist "){
                let commandData = data.match(secondArg);
                console.log("Second Regex", commandData[1]);
                if (command[0] === "/w "){
                    let goTo;
                    clients.forEach((sclient) => {
                        if (sclient.getProperty('name') === commandData[1]){
                            goTo = sclient;
                        };
                    });
                    if (!goTo){
                        client.getProperty('client').write("Client '"+commandData[1]+"' not found!");
                    }else{
                        if (client.getProperty('name') !== commandData[1]){
                            goTo.getProperty('client').write("//Whisper from '"+client.getProperty('name')+"': "+data+"\n");
                        }else{
                            client.getProperty('client').write("You cannot whisper to yourself.");
                        }
                    };
                }else if(command[0] === "/username "){
                    //update username
                }else if(command[0] === "/kick "){
                    //kick user with name if the password matches
                }
            }else{
                //List all clients back to client
            };
        }else{
            client.getProperty('client').write("Invalid command.");
        };
    }else{
        let sendingClient = null;
        clients.forEach((sClient) => {
            if (sClient.getProperty('client') === client.getProperty('client')){
                sendingClient = sClient;
            };
        });
        serverLog.write(sendingClient.getProperty('name')+"("+sendingClient.getProperty('id')+"): "+data+"\n");
        clients.forEach((sClient) => {
            if (client.getProperty('client') !== sClient.getProperty('client')){
                sClient.getProperty('client').write(sendingClient.getProperty('name')+": "+data);
            };
        });
    };
};

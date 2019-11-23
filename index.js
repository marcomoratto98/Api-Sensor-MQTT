const fs = require('fs');
const Influx = require('influx');
const mqtt = require('mqtt');
const fastify = require('fastify')({
    logger: true,
    ignoreTrailingSlash: true
});

fastify.register(require('./api/data'), { prefix: '/api/data' });

const start = async () => {
    try {
        await fastify.listen(3000)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start();

var client = mqtt.connect('mqtt://localhost');
var db = [];
var schema;

fs.readFile('config.txt', (err, obj) => {
    if (err) 
      throw err; 
    var datas = obj.toString(); 
    var data = datas.split(",");
    db = [];
    for (let i = 0; i < data.length; i++) {
      var s = data[i].split("\'");
      db[i] = s[1];
    }
    createSchema(db);
})

createSchema = (db) => {
    schema = {
      host: db[0],
      database: db[1],
      username: db[2],
      password: db[3],
      schema: [{
        measurement: 'position',
        fields: { 
          lat: Influx.FieldType.FLOAT,
          lon: Influx.FieldType.FLOAT,
          npersone: Influx.FieldType.INTEGER,
          porte: Influx.FieldType.BOOLEAN 
        },
        tags: ['linea', 'nautobus']
      }]
    }
}

const influx = new Influx.InfluxDB(schema);

client.on('connect', function (){
    client.subscribe('/bus/dati', function (err){
        console.log('Subscribed to /bus/dati');
        if (err)
            console.log('Errore di connessione');
    })
})

client.on('message', function(topic, message) {
    var data=JSON.parse(message.toString());
    var datess=Date.parse(data.date)* 1000000;
        
    influx.getDatabaseNames().then(names => {
        if (!names.includes(db[1])) {
            return influx.createDatabase(db[1]);
        }
    }).then(() => {
        influx.writePoints([{
            measurement: 'position',
            tags: {
                linea: data.linea,
                nautobus: data.nautobus,
            },
            fields: { 
                lat: data.distance[0],
                lon: data.distance[1],
                npersone: data.people,
                porte: data.porte 
            },
            timestamp: datess,
        }], {
            database: db[1]
        }).then(function(){
            console.log('Dati inseriti');
        }).catch(error => {
            console.log('Errore: '+error);
        });
    }).catch(error => console.log({ error }));
})

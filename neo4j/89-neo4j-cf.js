var neo4j = require("node-neo4j")

module.exports = function(RED) {
    function Neo4jConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.hostname = n.hostname;
        this.protocol = n.protocol;
        this.port = n.port;
        this.name = n.name;
    }

    RED.nodes.registerType("neo4j server", Neo4jConfigNode,{
        credentials: {
            username: {type:"text"},
            password: {type: "password"}
        }
    });

    function Neo4jNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.neo4j = config.neo4j;
        this.neo4jConfig = RED.nodes.getNode(this.neo4j);
        
        if (this.neo4jConfig) {
            var url = this.neo4jConfig.protocol + '://' + this.neo4jConfig.credentials.username + ':' + this.neo4jConfig.credentials.password + '@' + this.neo4jConfig.hostname + ':' + this.neo4jConfig.port;
            var db = new neo4j(url);
            var ctx = this;
            this.on('input', function(msg) {
                var query = config.query;
                var params = msg.payload;
                db.cypherQuery(query, params, function (err, results){
                    if (err) ctx.error(err);
                    msg.payload = results;
                    node.send(msg);
                });           
            });
        } else {
            this.error('missing neo4j server config');
        }
    }

    RED.nodes.registerType("neo4j",Neo4jNode);
}

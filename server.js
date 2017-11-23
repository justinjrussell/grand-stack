var express = require('express');
var bodyParser = require('body-parser');
var { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
var { makeExecutableSchema } = require('graphql-tools');
var { Engine } = require('apollo-engine');
var { neo4jgraphql } = require('neo4j-graphql-js');
var { v1: neo4j } =  require('neo4j-driver');
var cors = require('cors');

const PORT = process.env.PORT || 4000;
const typeDefs = [`
    type Category {
        categoryID: ID!
        categoryName: String
        description: String
        picture: String
        products(first: Int = 3, offset: Int = 0):[Product] @relation(name: "PART_OF", direction:"IN")
    }
    type Customer {
        customerID: ID!
        country: String
        contactTitle: String
        address: String
        city: String
        phone: String
        contactName: String
        postalCode: String
        companyName: String
        fax: String
        region:	String
        orders(first: Int = 3, offset: Int = 0): [Order] @relation(name: "PURCHASED", direction:"OUT")
    }
    type Order {
        shipCity: String
        orderID: String
        freight: String
        requiredDate: String
        employeeID: String
        shipName: String
        shipPostalCode:	String
        shipCountry: String
        shipAddress: String
        shipVia: String
        customerID:	String
        orderDate: String
        shippedDate: String
        shipRegion:	String
        products(first: Int = 3, offset: Int = 0): [Product] @relation(name: "ORDERS", direction:"OUT")
    }
    type Product {
        unitPrice: String
        reorderLevel: String
        unitsInStock: String
        supplierID: String
        productID: String
        discontinued: String
        quantityPerUnit: String
        categoryID: String
        productName: String
        unitsOnOrder: String
        categories(first: Int = 3, offset: Int = 0): [Category] @relation(name: "PART_OF", direction:"OUT")
        suppliers(first: Int = 3, offset: Int = 0): [Supplier] @relation(name: "SUPPLIES", direction:"IN")
    }
    type Supplier {
        country: String
        contactTitle: String
        supplierID: String
        address: String
        phone: String
        city: String
        contactName: String
        postalCode: String
        companyName: String
        fax: String
        region: String
        homePage: String
        products(first: Int = 3, offset: Int = 0): [Product] @relation(name: "SUPPLIES", direction:"OUT")
    }
    type Query {
        hello: String
        Category(categoryID: ID, categoryName: String, first: Int, offset: Int):[Category]
        Customer(first: Int, offset: Int):[Customer]
        Order(first: Int, offset: Int):[Order]
        Product(first: Int, offset: Int):[Product]
        Supplier(first: Int, offset: Int):[Supplier]
    }
    schema {
        query: Query
    }
`];
const resolvers = {
    Query: {
        hello(root) {
            return 'world';
        },
        Category(object, params, ctx, resolveInfo) {
            return neo4jgraphql(object, params, ctx, resolveInfo);
        },
        Customer(object, params, ctx, resolveInfo){
            return neo4jgraphql(object, params, ctx, resolveInfo);
        },
        Order(object, params, ctx, resolveInfo){
            return neo4jgraphql(object, params, ctx, resolveInfo);
        },
        Product(object, params, ctx, resolveInfo){
            return neo4jgraphql(object, params, ctx, resolveInfo);
        },
        Supplier(object, params, ctx, resolveInfo){
            return neo4jgraphql(object, params, ctx, resolveInfo);
        }
    }
};

const schema = makeExecutableSchema({typeDefs,resolvers});
const app = express();
const rootValue = {};

let driver;

function context(headers, secrets) {
    if (!driver) {
        driver = neo4j.driver(
            secrets.NEO4J_URI || "bolt://localhost:7687", 
            neo4j.auth.basic(
                secrets.NEO4J_USER || "neo4j", 
                secrets.NEO4J_PASSWORD || "letmein"
            )
        );
    }
    return {
        driver, 
        headers
    };
}
app.use(cors())
app.use(engine.expressMiddleware());
app.use(
    '/graphql', 
    bodyParser.json(), 
    graphqlExpress(request => ({ 
        schema,
        rootValue,
        context: context(request.headers, process.env)
    }))
);
app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));
app.listen(PORT, () => console.log(`Now browse to localhost:${PORT}/graphql`));
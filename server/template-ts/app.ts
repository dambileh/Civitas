import * as express from "express";
import * as swaggerTools from "swagger-tools";
import * as fs from "fs";
import * as mongoose from "mongoose";
import * as config from "config";
import * as errorHandler from "../libs/error/ErrorHandler";
import * as logging from "./utilities/Logging";
import * as subscriptionManager from "./managers/SubscriptionManager";
import * as processHelper from "../libs/ProcessHelper";
import * as path from "path";
import * as _ from "lodash";

class App {
    public express: express.Application;

    constructor () {
        this.express = express();
        this.setupDB();
        this.setupSwagger();
    }

    private setupSwagger (): void {
        const that = this;

        // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
        const swaggerDoc = fs.readFileSync("./api/swagger.json", "utf8");

        /**
         * Initialize the Swagger middleware.
         *
         * @param {object} swaggerDoc - The swagger document object
         * @param {function} callback - The callback
         *
         * @author Kevin Feng <kevin.feng@gmail.com>
         * @since  10 Sept 2017
         */
        swaggerTools.initializeMiddleware(JSON.parse(swaggerDoc), middleware => {
            // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
            that.express.use(middleware.swaggerMetadata());

            // Validate Swagger requests
            that.express.use(middleware.swaggerValidator());

            // Route validated requests to appropriate controller
            // that.express.use(middleware.swaggerRouter(options));

            that.express.use(middleware.swaggerRouter({
                controllers: that.getSwaggerControllers("./dist/template-ts/controllers"),
                useStubs: process.env.NODE_ENV === "development" // Conditionally turn on stubs (mock mode)
            }));

            // Serve the Swagger documents and Swagger UI
            if (process.env.NODE_ENV !== "ci") {
                that.express.use(middleware.swaggerUi());
            }

            that.express.use(errorHandler.onError);

            subscriptionManager.initialize();

            processHelper.handleProcessExit();

            processHelper.bootstrap();
        });
    }

    private setupDB (): void {
        const mongoConfig: any = config.get<any>("mongo");

        mongoose.connect(mongoConfig.database_host, mongoConfig.options);
        mongoose.connection.on(
          "error",
          function (error: any) {
              logging.logAction(logging.logLevels.ERROR, "MongoDB connection error", error.stack);
          }
        );
    }

    private getSwaggerControllers (controllersDir: string): any {
        const handlerCache: any = {};
        const jsFileRegex = /\.(ts|js)$/;

        for (const file of fs.readdirSync(controllersDir)) {
            const controllerName = file.replace(jsFileRegex, "");

            let controller;

            if (file.match(jsFileRegex)) {

                controller = require(path.resolve(path.join(controllersDir, controllerName)));
                if (_.isPlainObject(controller)) {
                    _.each(controller, function (value: any, name: any) {
                        const handlerId: string = controllerName + "_" + name;
                        if (_.isFunction(value) && !handlerCache[handlerId]) {
                            handlerCache[handlerId] = value;
                        }
                    });
                }
            }
        }

        return handlerCache;
    }
}


export default new App().express;
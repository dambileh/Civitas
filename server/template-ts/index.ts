import app from "./app";

const port = process.env.PORT || 5000;

app.listen(port, (err: any) => {
    if (err) {
        return console.log(err);
    }

    console.log(`Your server is listening on port ${port} (http://localhost:${port})`);
    if (process.env.NODE_ENV !== "ci") {
        console.log(`Swagger-ui is available on http://localhost:${port}/docs`);
    }
});
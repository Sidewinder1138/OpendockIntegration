import express from "express";
import morgan from "morgan";

const AppTitle = "RefNum Validator Example";
const PORT = 8080;

async function main() {
  console.log(AppTitle);

  const app = express();
  app.use(express.json()); // JSON body parsing
  app.use(morgan("dev")); // Logging

  app.get("/", (req, res) => {
    res.send(`${AppTitle}: Hello World!`);
  });

  app.listen(PORT, () => {
    console.log(`Listening on: http://localhost:${PORT}`);
  });
}
main();

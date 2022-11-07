import express from "express";

const AppTitle = "RefNum Validator Example";
const PORT = 8080;

async function main() {
  console.log(AppTitle);

  const app = express();

  app.get("/", (req, res) => {
    res.send(`${AppTitle}: Hello World!`);
  });

  app.listen(PORT, () => {
    console.log(`Listening on: http://localhost:${PORT}`);
  });
}
main();

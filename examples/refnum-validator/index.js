//
// RefNum Validator - Opendock Integration Example
//
// For more information on the RefNumber Validation Protocol, see here:
// https://opendock.zendesk.com/hc/en-us/articles/7717801611667-PO-Ref-Number-Validation-Implementation
//
import express from "express";
import morgan from "morgan";

const AppTitle = "RefNum Validator Example";
const PORT = 8080;

async function main() {
  console.log(AppTitle);

  const app = express();
  app.use(express.json()); // JSON body parsing
  app.use(morgan("dev")); // Logging

  // This endpoint isn't part of the RefNumber Validation Protocol, but we
  // include it just so it's easy to point a browser at our server and check
  // if it is running:
  app.get("/", (req, res) => {
    res.send(`${AppTitle}: Hello World!`);
  });

  // Here is our POST request handler, to recieve the incoming appointment
  // create/update hook call from Opendock. This is the one and only endpoint we need
  // in order to implement the RefNumber Validation Protocol.
  app.post("/v2/validate", (req, res) => {
    // The incoming POST body will be a JSON object containing the Appointment
    // "context", which is all the relevant data about the pending appointment that
    // is about to be created (or existing appointment that is about to be updated).
    // Note that we are using the express.json() body parser (see above), to the req.body
    // is already a JSON object at this point:
    const ctx = req.body;

    // We can always read the Reference Number from the appointmentFields object:
    const refNumber = ctx.appointmentFields.refNumber;
    console.log("* Got Ref Number:", refNumber);

    // Here we enforce a rule that ensures all refnums start with the characters 'ABC':
    if (!refNumber.startsWith("ABC")) {
      console.log('* RefNum Bad: must start with "ABC"');
      // We reply with an HTTP error code, and also send back a JSON object containing a custom
      // error message, which will be displayed in the Opendock UI to our user, to help them
      // correct the mistake:
      res.status(500).json({
        errorMessage: "Reference Number must start with 'ABC'",
      });
      return;
    }

    // RefNum is good! So we just reply with an HTTP success code:
    console.log("* RefNum GOOD :)");
    res.status(200).end();
  });

  app.listen(PORT, () => {
    console.log(`Listening on: http://localhost:${PORT}`);
  });
}
main();

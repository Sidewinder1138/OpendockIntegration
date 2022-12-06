//
// RefNum Validator - Opendock Integration Example
//
// For more information on the RefNumber Validation Protocol, see here:
// https://opendock.zendesk.com/hc/en-us/articles/7717801611667-PO-Ref-Number-Validation-Implementation
//
import express from "express";
import morgan from "morgan";
import { DateTime } from "luxon";

const AppTitle = "RefNum Validator Example";
let PORT = 8080;

async function main() {
  console.log(AppTitle);

  if (process.argv.length === 3) {
    PORT = Number(process.argv[2]);
  }

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
    const debug = false;

    // The incoming POST body will be a JSON object containing the Appointment
    // "context", which is all the relevant data about the pending appointment that
    // is about to be created (or existing appointment that is about to be updated).
    // Note that we are using the express.json() body parser (see above), to the req.body
    // is already a JSON object at this point:
    const ctx = req.body;
    if (debug) {
      console.log("ctx=", JSON.stringify(ctx, null, 2));
    }

    // If this is a "create", then we can try to read the Reference Number from the
    // appointmentFields object. If this is an "update", then we can first look to
    // appointmentFields (in case user is changing the refnum), but if it isn't there,
    // then we can look in the existingAppointment object:
    let refNumber = ctx.appointmentFields.refNumber;
    if (ctx.action === "update" && !refNumber) {
      refNumber = ctx.existingAppointment.refNumber;
    }

    if (refNumber) {
      console.log("* Got Ref Number:", refNumber);

      // Enforce the "passcode", but only if the RefNum contains the text ":PASS:".
      // Normally, in a *REAL* validator, you would always want to enforce the passcode, but
      // this way for demo purposes, we can turn enforcement on/off:
      if (refNumber.includes(":CODE:")) {
        // Read the passcode out of auth header:
        const passcode = req.headers.authorization;

        if (!passcode) {
          return res.status(500).json({
            errorMessage: "Passcode not set!",
          });
        }

        const expectedCode = "123456";
        if (passcode !== `Bearer ${expectedCode}`) {
          return res.status(500).json({
            errorMessage: "Passcode incorrect!",
          });
        }
      }

      // Here we enforce a rule that ensures all refnums start with the characters 'ABC':
      if (!refNumber.startsWith("ABC")) {
        console.log('* RefNum Bad: must start with "ABC"');
        // We reply with an HTTP error code, and also send back a JSON object containing a custom
        // error message, which will be displayed in the Opendock UI to our user, to help them
        // correct the mistake:
        return res.status(500).json({
          errorMessage: "Reference Number must start with 'ABC'",
        });
      }
    }

    // Play with the start date/time:
    const startStr =
      ctx.appointmentFields.start || ctx.existingAppointment?.start;
    const start = DateTime.fromISO(startStr).setZone("America/Phoenix");
    console.log("start=", start.toLocaleString(DateTime.DATETIME_FULL));
    // Don't allow appointments that start at 10:00 AM (America/Phoenix):
    if (start.hour == 10 && start.minute == 0) {
      return res.status(500).json({
        errorMessage:
          "Appointments at 10:00 AM are not allowed, choose another time.",
      });
    }

    // Play with custom fields:
    const customFields =
      ctx.appointmentFields.customFields ||
      ctx.existingAppointment?.customFields;
    console.log("customFields=", customFields);
    // Grab out pallet count:
    let palletCount = null;
    for (const field of customFields) {
      if (field.label === "Pallet Count") {
        palletCount = Number(field.value);
        break;
      }
    }
    // Enforce pallet count rules (but ignore if the field hasn't been configured):
    if (palletCount !== null) {
      if (palletCount > 26) {
        return res.status(500).json({
          errorMessage: `Pallet count of ${palletCount} is too high (max 26).`,
        });
      }
      if (palletCount < 5) {
        return res.status(500).json({
          errorMessage: `Pallet count of ${palletCount} is too low (min 5).`,
        });
      }
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

import mongoose from "mongoose";
import { Agenda, Job } from "@hokify/agenda";
import Appointment from "../models/Appointment";

const mongoConnectionString = process.env.DB_CONNECT;
if (!mongoConnectionString) {
  throw new Error("DB_CONNECT must be set in env");
}

const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: "agendaJobs",
    
  }
});

agenda.define("cancel appointment", async (job: Job) => {
  const { appointmentId } = job.attrs.data as { appointmentId: string };
  const appt = await Appointment.findById(appointmentId);
  if (!appt) return;
  if (appt.status === "confirmed" || appt.status === "pending") {
    appt.status = "canceled";
    await appt.save();
  }
});


agenda.on("ready", () => {
  agenda.start()
    .then(() => console.log("Agenda started"))
    .catch(err => console.error("Agenda failed to start:", err));
});

export default agenda;

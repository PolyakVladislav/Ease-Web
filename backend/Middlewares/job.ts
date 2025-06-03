import mongoose from "mongoose";
import Agenda, { Job } from "agenda";
import Appointment from "../models/Appointment";

const mongoDb: any = mongoose.connection.db;

const agenda: Agenda = new (Agenda as any)(mongoDb, "agendaJobs");

agenda.define("cancel appointment", async (job: Job) => {
  const { appointmentId } = job.attrs.data as { appointmentId: string };
  const appt = await Appointment.findById(appointmentId);
  if (!appt) return;

  if (appt.status === "confirmed") {
    appt.status = "canceled";
    await appt.save();
    console.log(`Appointment ${appointmentId} was automatically canceled.`);
  }
});

(async function () {
  if (mongoose.connection.readyState === 1) {
    await agenda.start();
  } else {
    mongoose.connection.once("open", async () => {
      await agenda.start();
    });
  }
})();

export default agenda;

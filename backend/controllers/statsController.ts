import { Request, Response } from "express";
import Appointment from "../models/Appointment";

export async function getAppointmentsByWeek(req: Request, res: Response) {
  const doctorId = req.query.doctorId as string;

  try {
    const data = await Appointment.aggregate([
      { $match: { doctorId } },
      {
        $group: {
          _id: {
            year:  { $isoWeekYear: "$createdAt" },
            week:  { $isoWeek: "$createdAt" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-W",
              {
                $cond: [
                  { $lte: ["$_id.week", 9] },
                  { $concat: ["0", { $toString: "$_id.week" }] },
                  { $toString: "$_id.week" },
                ],
              },
            ],
          },
          count: 1,
        },
      },
      { $sort: { period: 1 } },
    ]);

    res.json(data); 
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "stats error" });
  }
}

export async function getSessionStatus(req: Request, res: Response) {
    const doctorId = req.query.doctorId as string;
  
    try {
      const agg = await Appointment.aggregate([
        { $match: { doctorId } },
        { $group: { _id: "$status", total: { $sum: 1 } } },
      ]);
  
      const out: Record<string, number> = {};
      agg.forEach((d) => (out[d._id] = d.total));
      res.json(out);                // → { passed:4, confirmed:3, cancelled:1 }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "stats error" });
    }
  }
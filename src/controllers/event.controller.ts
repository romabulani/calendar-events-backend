import { Request, Response } from "express";
import { Event } from "../models/event.model";
import { IUser, User } from "../models/user.model";
import { getGoogleCalendarEvents } from "./googleAuth.controller";

export const createEvent = async (req: Request, res: Response) => {
  const { name, datetime, duration, tag } = req.body;
  const userId = req?.user?.id;
  try {
    const startTime = new Date(datetime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const overlappingEvent = await Event.findOne({
      userId,
      datetime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlappingEvent) {
      return res
        .status(400)
        .json({ message: "This time slot is occupied by another event" });
    }

    const newEvent = new Event({
      name,
      datetime: startTime,
      endTime,
      duration,
      tag,
      userId,
    });
    await newEvent.save();

    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Creation of event failed. Please try again after some time.",
    });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  const { email, tag, limit = 50, sort = "asc" } = req.query;
  const filter: Record<string, any> = {};
  let events: any[] = [];
  let googleError = false;
  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      filter.userId = user._id;
    } else if (req?.user?.id) {
      user = await User.findOne({ _id: req.user.id });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.googleSyncFlag) {
        try {
          const googleEvents = await getGoogleCalendarEvents(
            user.googleToken,
            user as IUser
          );
          events = events.concat(googleEvents);
        } catch (error) {
          console.error("Error fetching Google events:", error);
          googleError = true;
        }
      } else {
        filter.tag = { $ne: "google-event" };
      }

      filter.userId = req.user.id;
    }

    if (tag) {
      filter.tag = tag;
    }

    const dbEvents = await Event.find(filter)
      .sort({ datetime: sort === "asc" ? 1 : -1 })
      .limit(Number(limit));
    events = events.concat(dbEvents);

    res
      .status(200)
      .json({
        events,
        message:
          user?.googleSyncFlag && googleError && !email
            ? "Failed to fetch Google Calendar events."
            : "",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again after some time.",
    });
  }
};

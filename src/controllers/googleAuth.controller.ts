import { Request, Response } from "express";
import { google } from "googleapis";
import { IUser, User } from "../models/user.model";
import { Event } from "../models/event.model";
import { FRONTEND_URL } from "../constants";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
export const getGoogleAuthUrl = (_req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
  res.json({ authUrl });
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const userId = req?.user?.id;
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);
    const user = await User.findOneAndUpdate(
      { userId },
      {
        googleSyncFlag: true,
        googleToken: tokens,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.redirect(`${FRONTEND_URL}?status=success`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}?status=failure`);
    console.error("Error retrieving access token or fetching events:", error);
    res.status(500).send("Failed to retrieve access token or fetch events.");
  }
};

export const getGoogleCalendarEvents = async (
  googleToken: any,
  user: IUser
) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(googleToken);

  const calendar = google.calendar({ version: "v3", auth });

  let events: any[] = [];
  let nextPageToken: string | undefined = undefined;

  try {
    do {
      const eventsResponse: any = await calendar.events.list({
        calendarId: "primary",
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
        timeMin: new Date().toISOString(),
        pageToken: nextPageToken,
      });

      if (eventsResponse.data.items) {
        events = events.concat(eventsResponse.data.items);
      }

      nextPageToken = eventsResponse.data.nextPageToken;
    } while (nextPageToken);

    if (events.length === 0) {
      return { message: "No upcoming events found." };
    }
    if (user.googleSyncFlag) {
      syncGoogleEventsToDB(events, user);
    }

    return events;
  } catch (error) {
    console.error("Error fetching calendar events: ", error);
    throw new Error("Failed to fetch Google Calendar events.");
  }
};

export const syncGoogleEventsToDB = async (
  googleEvents: any[],
  user: IUser
) => {
  googleEvents.forEach(async (event) => {
    const existingEvent = await Event.findOne({ googleEventId: event.id });
    try {
      const startDate = new Date(event.start.dateTime);
      const endDate = new Date(event.end.dateTime);
      const duration = Math.floor(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / 60000
      );
      if (!existingEvent && !isNaN(duration)) {
        await Event.create({
          googleEventId: event.id,
          name: event.summary,
          datetime: new Date(event.start.dateTime).toISOString(),
          userId: user._id,
          tag: "google-event",
          duration: duration,
          endTime: new Date(event.end.dateTime).toISOString(),
        });
      }
    } catch (e) {}
  });
};

export const resetGoogleSyncFlag = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;
    const filter: Record<string, any> = {};
    let events: any[] = [];
    filter.userId = userId;
    filter.tag = { $ne: "google-event" };
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { googleSyncFlag: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    events = await Event.find(filter);
    res
      .status(200)
      .json({ events, message: "Google sync flag reset successfully", user });
  } catch (error) {
    console.error("Error resetting Google sync flag:", error);
    res.status(500).json({ message: "Failed to reset Google sync flag" });
  }
};

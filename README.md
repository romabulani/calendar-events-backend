
## Calendar Events Backend
This [project](https://calendarevents-backend.vercel.app/) is a backend application for managing calendar events. It provides user registration and authentication, event creation, and event listing functionalities. It integrates with Google Calendar for users who enable the feature, ensuring seamless event synchronization.

### Features
#### User Management
- Register a user: Create a new user account.
- Login: Authenticate a user and provide a JWT token for API access.
- Feature Flag for Google Calendar: Users can enable or disable syncing events with Google Calendar using a googleSyncFlag.
  
### Events Management
- Create an Event: Only one event can be created in a given occupied time slot. Automatically checks Google Calendar for overlaps if the googleSyncFlag is enabled.
- List Events: Retrieve events for the authenticated user or others. Supports filtering, sorting, and pagination options. These options are not tested.
- Google Calendar Sync: Syncs events to the user's Google Calendar when the feature is enabled. Handles Google Calendar API token for authenticated users.
- Search Other User's Events: Logged in users can search for other user's email and then they can get their events.

### Database Schema
#### User Schema
```
  _id: mongoose.Schema.Types.ObjectId; // Automatically generated
  email: string; // User's email address
  password: string; // Encrypted password
  googleSyncFlag: boolean; // Feature flag for Google Calendar sync
  googleToken?: Record<string, any>; // Token details for Google Calendar API
  createdAt: Date; // Timestamp when the user was created
  updatedAt: Date; // Timestamp when the user was last updated
```

#### Event Schema

```
  {
    _id: mongoose.Schema.Types.ObjectId, // Automatically generated
    name: { type: String, required: true }, // Event name
    datetime: { type: Date, required: true }, // Event start date and time
    duration: { type: Number, required: true }, // Event duration in minutes
    endTime: { type: Date, required: true }, // Calculated end time
    tag: { type: String, required: true }, // Event tag/category
    googleEventId: { type: String, required: false }, // Google Calendar event ID (if synced)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Reference to the user who created the event
  },
```

### API Documentation
[Swagger Docs](https://calendarevents-backend.vercel.app/api-docs/)

### Setup Instructions
```
git clone https://github.com/romabulani/calendar-events-backend
cd calendar-events-backend
npm install
```

Set up environment variables in a .env file:
```
MONGO_URL=<your-mongodb-connection-string>
DB_NAME=<your-db-name>
SECRET_KEY=<your-secret-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=<your-google-oauth-redirect-uri>
```
```
npm start
```

### Notes
Ensure to add users in the Google Cloud Console project for Google Calendar API access. Without this, Google integration will not work.

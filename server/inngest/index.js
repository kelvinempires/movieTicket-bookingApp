import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// inngest functions to serve user data to database
const syncUserFunction = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {id,first_name, last_name, email_address, image_url} = event.data;
    const userData = {
      _id: id,
      email: email_address[0].email_address,
      name: first_name + ' ' + last_name,
      image: image_url,
    };
    await User.create(userData);
  }
);

// Export the functions to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
   const {id} = event.data;
   await User.findByIdAndDelete(id);
  }
);

// inngest functions to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-with-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {id,first_name, last_name, email_address, image_url} = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_address[0].email_address,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userData);
  }
);


export const functions = [syncUserFunction, syncUserDeletion, syncUserUpdation];
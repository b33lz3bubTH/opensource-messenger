// src/events.ts
import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();


export const events = {
    notifyUser: "notifyUser",
    broadcastGroupMessage: "broadcastGroupMessage"
}

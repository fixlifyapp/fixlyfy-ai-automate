
import { Message, SavedPrompt } from "@/types/assistant";
import { v4 as uuidv4 } from "uuid";

export const sampleMessages: Message[] = [
  {
    id: uuidv4(),
    content: "Hello! I'm your AI assistant. How can I help you today with your service business?",
    role: "assistant",
    timestamp: new Date().toISOString()
  }
];

export const sampleSavedPrompts: SavedPrompt[] = [
  {
    id: uuidv4(),
    title: "Create job invoice template",
    content: "Create a template for invoicing HVAC service jobs with parts and labor",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    title: "Customer follow-up email",
    content: "Write a follow-up email to clients after completing a plumbing job",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    title: "Service recommendation",
    content: "Suggest additional services for customers who had an AC maintenance",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

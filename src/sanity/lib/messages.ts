import { client, writeClient } from './client';

export interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export async function getMessagesByJobId(jobId: string): Promise<Message[]> {
  return client.fetch(
    `*[_type == "message" && job._ref == $jobId] | order(timestamp asc){
      _id,
      sender,
      content,
      timestamp
    }`,
    { jobId }
  );
}

export async function sendMessage(jobId: string, sender: string, content: string) {
  return writeClient.create({
    _type: 'message',
    job: { _type: 'reference', _ref: jobId },
    sender,
    content,
    timestamp: new Date().toISOString(),
  });
}

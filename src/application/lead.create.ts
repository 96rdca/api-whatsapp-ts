import LeadExternal from "../domain/lead-external.repository";
import async, { DataContainer } from "async";

interface MessageData {
  message: string;
  phone: string;
}

interface TaskResult {
  responseExSave: any; // Adjust the type of responseExSave accordingly
}

export class LeadCreate {
  private messageQueue: async.QueueObject<MessageData>;
  private leadExternal: LeadExternal;
  constructor(respositories: [LeadExternal]) {
    const [leadExternal] = respositories;
    this.leadExternal = leadExternal;

    // Create a queue with concurrency of 1
    this.messageQueue = async.queue<MessageData, TaskResult>(async ({ message, phone }: { message: string, phone: string }, callback: any) => {
      console.log(`En cola: ${this.messageQueue.length()}`);

      await this.delay(2000, 2000);

      const checkNumber = await this.leadExternal.checkNumber(phone);

      if (checkNumber.hasWhatsapp) {
        await this.delay(13000, 13000); // Wait between 15s and 30s

        const responseExSave = await this.leadExternal.sendMsg({ message, phone });// enviar a ws

        callback(null, { responseExSave, time: new Date().toLocaleTimeString() });

      } else {
        callback(null, { checkNumber, time: new Date().toLocaleTimeString() });
      }
    }, 1);
  }

  // Utility function for delaying execution
  private delay(minDelay: number, maxDelay: number) {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  public async sendMessage({ message, phone }: MessageData) {
    try {
      this.messageQueue.push({ message, phone }, (error?: Error | null, result?: TaskResult | null) => {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      });

      return { success: `${phone} and message added to queue.` };
    } catch (error) {
      console.log(error);
      return { error: 'Error ocurred when adding to the queue' }
    }
  }

  public async removeMessageByPhone(phone: string) {
    this.messageQueue.remove((item: DataContainer<MessageData>) => item.data.phone === phone);

    return { success: `${phone} and message removed from the queue` };
  }

  public async clearQueue() {
    if (this.messageQueue.length() === 0)
      return { error: 'Queue is already empty' };

    this.messageQueue.kill();

    return { success: 'Queue is now empty' };
  }
}

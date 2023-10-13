import LeadExternal from "../domain/lead-external.repository";
import LeadRepository from "../domain/lead.repository";
import async from "async";

interface MessageData {
  message: string;
  phone: string;
}

interface TaskResult {
  responseExSave: any; // Adjust the type of responseExSave accordingly
}

export class LeadCreate {
  private messageQueue: async.QueueObject<MessageData>;
  // private leadRepository: LeadRepository;
  private leadExternal: LeadExternal;
  constructor(respositories: [LeadRepository, LeadExternal]) {
    const [leadRepository, leadExternal] = respositories;
    // this.leadRepository = leadRepository;
    this.leadExternal = leadExternal;

    // Create a queue with concurrency of 1

    this.messageQueue = async.queue<MessageData, TaskResult>(async ({ message, phone }: { message: string, phone: string }, callback: any) => {
      // const responseDbSave = await this.leadRepository.save({ message, phone });//TODO DB
      await this.delay(15000, 20000); // Wait between 15s and 30s
      console.log(`En cola: ${this.messageQueue.length()}`);

      const responseExSave = await this.leadExternal.sendMsg({ message, phone });//TODO enviar a ws

      callback(null, { responseExSave, phone, time: new Date().toLocaleTimeString() });
    }, 1);
  }

  // Utility function for delaying execution
  private delay(minDelay: number, maxDelay: number) {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  public async sendMessageAndSave({ message, phone }: MessageData) {
    const messageData = { message, phone };

    this.messageQueue.push(messageData, (error?: Error | null, result?: TaskResult | null) => {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
      }
    });

    return { success: "Message added to queue." };
  }

  // public async sendMessageAndSave({
  //   message,
  //   phone,
  // }: {
  //   message: string;
  //   phone: string;
  // }) {
  //   const responseDbSave = await this.leadRepository.save({ message, phone });//TODO DB
  //   const responseExSave = await this.leadExternal.sendMsg({ message, phone });//TODO enviar a ws

  //   return {responseDbSave, responseExSave};
  // }
}

import { Request, Response } from "express";
import * as path from 'path';
import * as fs from 'fs'; // Import the fs module
import { LeadCreate } from "../../application/lead.create";

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) { }

  public sendCtrl = async ({ body }: Request, res: Response) => {
    const { message, phone } = body;
    const response = await this.leadCreator.sendMessageAndSave({ message, phone })
    res.send(response);
  };

  public serveImage = (req: Request, res: Response) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(process.cwd(), '/tmp', imageName);
    // Check if the file exists
    if (fs.existsSync(imagePath)) {
      // Serve the image using express.static middleware
      res.sendFile(imagePath);
    } else {
      // Return a 404 error if the image does not exist
      res.status(404).send('Login not found');
    }
  };
}

export default LeadCtrl;

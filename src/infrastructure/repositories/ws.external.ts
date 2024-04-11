import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
import qrcode from 'qrcode-terminal';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;
  private readonly folderName = 'tmp';

  constructor() {

    super({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--unhandled-rejections=strict",
        ],
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
      }
    });

    console.log("Loading Whatsapp-Web.js...");

    this.on("ready", () => {
      this.status = true;
      console.log("LOGIN_SUCCESS");
    });

    this.on("auth_failure", () => {
      this.status = false;
      console.log("LOGIN_FAIL");
    });

    this.on("qr", (qr) => {
      console.log(`Escanea el codigo QR.\n -> Folder: ${this.folderName}/qr.svg \n -> Terminal\n -> Route: .../login/qr.svg`);

      this.generateImage(qr);

      qrcode.generate(qr, { small: true });
    });

    this.initialize();
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg(lead: { message: string; phone: string }): Promise<any> {
    try {
      const { message, phone } = lead;

      if (!this.status) return Promise.resolve({ error: "Wait Login", phone });

      // send the message to the whatsapp
      const response = await this.sendMessage(`${phone}@c.us`, message);
      return { id: response.id.id, phone };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  /**
   * Enviar mensaje de WS con imagen adjunta
   * @param lead 
   * @returns 
   */
  async sendMsgWithPhoto({ message, phone }: { message: string; phone: string; }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "Wait Login", phone });

      const media = MessageMedia.fromFilePath(`${process.cwd()}/${this.folderName}/milkshake.png`);

      const response = await this.sendMessage(`${phone}@c.us`, media, { caption: message });

      return { id: response.id.id, phone };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async checkNumber(phone: string): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "Wait Login", phone });

      const isWhatsappNumb = await this.isRegisteredUser(`${phone}@c.us`);

      if (!isWhatsappNumb) {
        return Promise.resolve({ hasWhatsapp: false, error: `The number ${phone} is not registered on Whatsapp` });
      }

      return Promise.resolve({ hasWhatsapp: true, error: '' });
    }
    catch (e: any) {
      return Promise.resolve({ hasWhatsapp: false, error: e.message });
    }
  }

  getStatus(): boolean {
    return this.status;
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/${this.folderName}`;

    let qr_svg = imageQr(base64, { type: "svg", margin: 4 });
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    // console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;

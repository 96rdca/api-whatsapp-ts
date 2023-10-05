import { Client, LocalAuth } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
import qrcode from 'qrcode-terminal';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

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
    });

    console.log("Loading Whatsapp-Web.js...");

    this.initialize();

    console.log(`Status ${this.getStatus()}`)

    this.on("ready", () => {
      this.status = true;
      console.log("LOGIN_SUCCESS");
    });

    this.on("auth_failure", () => {
      this.status = false;
      console.log("LOGIN_FAIL");
    });

    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carepta tmp or terminal");
      this.generateImage(qr);
      // show qr on console
      qrcode.generate(qr, { small: true });
    });
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg(lead: { message: string; phone: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { message, phone } = lead;

      // Check is the number is registered on the platform
      const isWhatsappNumb = await this.isRegisteredUser(`${phone}@c.us`);
      if (!isWhatsappNumb) {
        throw Error(`The number ${phone} is not registered on WhatsApp.`);
      }

      // Wait between 2s and 5s
      await this.delay(2000, 5000);

      // send the message to the whatsapp
      const response = await this.sendMessage(`${phone}@c.us`, message);
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  private delay(minDelay: number, maxDelay: number) {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  getStatus(): boolean {
    return this.status;
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "svg", margin: 4 });
    console.log(path);
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;

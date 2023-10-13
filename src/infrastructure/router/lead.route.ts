import { Router } from "express";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";
const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");
router.post("/sendText", leadCtrl.sendText);
router.post("/removeByPhone", leadCtrl.removeText);
router.get('/Login/:imageName', leadCtrl.loginWithImage);

export { router };

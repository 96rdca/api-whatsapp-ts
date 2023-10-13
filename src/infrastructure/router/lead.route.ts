import { Router } from "express";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";
const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");
router.get('/Login/:imageName', leadCtrl.loginWithImage);
router.post("/queue/add", leadCtrl.sendText);
router.post("/queue/removeByPhone", leadCtrl.removeText);
router.get("/queue/clear", leadCtrl.clearQueue);

export { router };

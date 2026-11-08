
import { Router } from "express";

import {
  createClaim,
  getAllClaims,
  getMyClaims,
  getMySubmittedClaims,
  updateClaimStatus,
} from "../controllers/claimController.js";


import {
  authenticateMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";



const router = Router();

// Logged-in users can submit claims
router.post("/", authenticateMiddleware, createClaim);

// Only Admin can view all claims
router.get("/", authenticateMiddleware, adminMiddleware, getAllClaims);

// View claims received by logged-in item owner
router.get("/my", authenticateMiddleware, getMyClaims);

// View claims submitted by logged-in user
router.get(
  "/submitted",
  authenticateMiddleware,
  getMySubmittedClaims
);
// Logged-in users can request approval/rejection
// Owner verification will happen inside the controller
router.put("/:id", authenticateMiddleware, updateClaimStatus);



export default router;

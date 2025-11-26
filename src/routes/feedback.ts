import { Router } from "express";
import { FeedbackForm } from "@concepts";
import { Request, Response } from "express";

const router = Router();

/**
 * GET /api/FeedbackForm/getFeedbackFormsByCreator
 * Get all feedback forms created by a specific user
 */
router.get("/getFeedbackFormsByCreator", async (req: Request, res: Response) => {
  try {
    const { creator, startDate, endDate } = req.query;

    if (!creator) {
      return res.status(400).json({ 
        success: false, 
        error: "creator query parameter is required" 
      });
    }

    const { feedbackForms } = await FeedbackForm.getFeedbackFormsByCreator({ 
      creator: creator as string,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.json({ success: true, feedbackForms });
  } catch (error) {
    console.error("Error getting feedback forms by creator:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get feedback forms" 
    });
  }
});

/**
 * POST /api/FeedbackForm/getFeedbackFormsByCreator
 * Get all feedback forms created by a specific user
 * This route matches the frontend client, which sends a JSON body
 * { creator, startDate?, endDate? } and expects { feedbackForms }.
 */
router.post("/getFeedbackFormsByCreator", async (req: Request, res: Response) => {
  try {
    const { creator, startDate, endDate } = req.body ?? {};

    if (!creator) {
      return res.status(400).json({
        success: false,
        error: "creator is required in the request body",
      });
    }

    const { feedbackForms } = await FeedbackForm.getFeedbackFormsByCreator({
      creator,
      startDate,
      endDate,
    });

    // Match the shape expected by the frontend: response.data.feedbackForms
    res.json({ feedbackForms });
  } catch (error) {
    console.error("Error getting feedback forms by creator (POST):", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get feedback forms",
    });
  }
});

/**
 * PUT /api/FeedbackForm/updateFeedbackForm
 * Update an existing feedback form
 */
router.put("/updateFeedbackForm", async (req: Request, res: Response) => {
  try {
    const { formId, updates } = req.body;
    
    if (!formId) {
      return res.status(400).json({ 
        success: false, 
        error: "formId is required in the request body" 
      });
    }

    const { updatedForm } = await FeedbackForm.updateFeedbackForm({
      formId,
      updates
    });
    
    res.json({ success: true, form: updatedForm });
  } catch (error) {
    console.error("Error updating feedback form:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update feedback form"
    });
  }
});

/**
 * DELETE /api/FeedbackForm/deleteFeedbackForm
 * Delete a feedback form
 */
router.delete("/deleteFeedbackForm", async (req: Request, res: Response) => {
  try {
    const { formId } = req.body;
    
    if (!formId) {
      return res.status(400).json({ 
        success: false, 
        error: "formId is required in the request body" 
      });
    }

    await FeedbackForm.deleteFeedbackForm({ formId });
    
    res.json({ success: true, message: "Feedback form deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback form:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete feedback form"
    });
  }
});

export default router;
